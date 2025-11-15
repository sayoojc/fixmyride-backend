import { injectable, inject } from "inversify";
import { TYPES } from "../../containers/types";
import { IOrderRepository } from "../../interfaces/repositories/IOrderRepository";
import mongoose, { Types } from "mongoose";
import { ISocketService } from "../../sockets/ISocketService";
import { IAddressRepository } from "../../interfaces/repositories/IAddressRepository";
import { AddressSnapshot } from "../../interfaces/address.interface";
import { INotificationRepository } from "../../interfaces/repositories/INotificationRepository";
import { IServiceRequestRepository } from "../../interfaces/repositories/IServiceRequestRepository";
import redis from "../../config/redisConfig";
import { INearbyProvider } from "../../models/serviceRequest.model";
import { INotification } from "../../models/notification.model";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import { IServicePackageRepository } from "../../interfaces/repositories/IServicePackageRepository";
import { IUserEmergencyOrderService } from "../../interfaces/services/user/IUserEmergencyOrderService";

@injectable()
export class UserEmergencyOrderService implements IUserEmergencyOrderService {
  constructor(
    @inject(TYPES.OrderRepository)
    private readonly _orderRepository: IOrderRepository,
    @inject(TYPES.AddressRepository)
    private readonly _addressRepository: IAddressRepository,
    @inject(TYPES.SocketService)
    private readonly _socketService: ISocketService,
    @inject(TYPES.NotificationRepository)
    private readonly _notificationRepository: INotificationRepository,
    @inject(TYPES.ServiceRequestRepository)
    private readonly _serviceRequestRepository: IServiceRequestRepository,
    @inject(TYPES.UserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TYPES.ServicePackageRepository)
    private readonly _servicePackageRepository: IServicePackageRepository
  ) {}
    async handleSuccessfulEmergencyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    packageId: string,
    selectedAddressId:
      | string
      | {
          addressLine1: string;
          addressLine2?: string;
          city: string;
          latitude: number;
          longitude: number;
          state: string;
          zipCode: string;
        },
    userId: string
  ) {
    try {
      const user = await this._userRepository.findOne({ _id: userId });
      const servicePackage = await this._servicePackageRepository.findOne({
        _id: packageId,
      });
      if (!servicePackage) throw new Error("Service package not found");
      if (!user) throw new Error("User not found");

      const userSnapshot = {
        _id: new Types.ObjectId(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone,
      };

      const servicesSnapshot = [
        {
          _id: servicePackage._id,
          title: servicePackage.title,
          description: servicePackage.description,
          priceBreakup: {
            parts: servicePackage.priceBreakup?.parts ?? [],
            laborCharge: servicePackage.priceBreakup?.laborCharge ?? 0,
            discount: servicePackage.priceBreakup?.discount ?? 0,
            tax: servicePackage.priceBreakup?.tax ?? 0,
            total: servicePackage.priceBreakup?.total ?? 0,
          },
          servicePackageCategory: "emergency",
        },
      ];
      let addressSnapshot: AddressSnapshot;
      if (typeof selectedAddressId === "string") {
        const addressDoc = await this._addressRepository.findOne({
          _id: new Types.ObjectId(selectedAddressId),
        });

        if (!addressDoc) throw new Error("Address not found");

        addressSnapshot = {
          _id: new Types.ObjectId(addressDoc._id),
          addressLine1: addressDoc.addressLine1,
          addressLine2: addressDoc.addressLine2 ?? "",
          city: addressDoc.city,
          state: addressDoc.state,
          zipCode: addressDoc.zipCode,
          location: addressDoc.location,
        };
      } else {
        addressSnapshot = {
          _id: undefined,
          addressLine1: selectedAddressId.addressLine1,
          addressLine2: selectedAddressId.addressLine2 || "",
          city: selectedAddressId.city,
          state: selectedAddressId.state,
          zipCode: selectedAddressId.zipCode,
          location: {
            type: "Point",
            coordinates: [
              selectedAddressId.latitude,
              selectedAddressId.longitude,
            ],
          },
        };
      }
      const orderData = {
        user: userSnapshot,
        vehicle: undefined,
        isEmergency:true,
        services: servicesSnapshot,
        totalAmount: servicePackage.priceBreakup?.total,
        finalAmount: servicePackage.priceBreakup?.total,
        paymentMethod: "online" as const,
        paymentStatus: "paid" as const,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        orderStatus: "placed" as const,
        serviceDate: new Date().toISOString(),
        selectedSlot: "immediate",
        address: addressSnapshot,
        orderedAt: new Date(),
      };

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const newOrder = await this._orderRepository.create(orderData);
        if (!newOrder) throw new Error("Emergency order creation failed");
        const nearbyProviderIds = (await redis.georadius(
          "providers:locations",
          addressSnapshot.location.coordinates[0],
          addressSnapshot.location.coordinates[1],
          20,
          "km"
        )) as string[];

        const pipeline = redis.pipeline();
        for (const providerId of nearbyProviderIds) {
          pipeline.get(`provider:socket:${providerId}`);
        }
        const results = await pipeline.exec();

        const nearbyProviders: INearbyProvider[] = [];
        results?.forEach(([err, socketId], index) => {
          const providerId = nearbyProviderIds[index];
          nearbyProviders.push({
            providerId: new Types.ObjectId(providerId),
            socketId: typeof socketId === "string" ? socketId : undefined,
            status: "notified",
          });
        });

        // Create service request
        await this._serviceRequestRepository.create({
          userId: new Types.ObjectId(userId),
          orderId: new Types.ObjectId(newOrder._id),
          serviceType: "emergency",
          location: {
            lat: addressSnapshot.location.coordinates[0],
            lng: addressSnapshot.location.coordinates[1],
          },
          status: "pending",
          nearbyProviders,
        });

        // Send notifications
        const notifications: Partial<INotification>[] = nearbyProviderIds.map(
          (providerId) => ({
            recipientId: new Types.ObjectId(providerId),
            recipientType: "provider",
            type: "service_request",
            message: "Emergency request nearby! 🚨",
            link: `/provider/orders/${newOrder._id}`,
            isRead: false,
            createdAt: new Date(),
          })
        );
        const userNotification: Partial<INotification> = {
          recipientId: new Types.ObjectId(userId),
          recipientType: "user",
          type: "order",
          message: "Your order has been placed successfully!",
          link: `/user/orders/${newOrder._id}`,
          isRead: false,
        };
        const notification = await this._notificationRepository.create(
          userNotification
        );
        if(!notification) throw new Error("Failed to create user notification for emergency order");
       const notificationsResult =  await this._notificationRepository.insertMany(notifications);
        if(notificationsResult.length !== notifications.length) throw new Error("Failed to create some provider notifications for emergency order");
           this._socketService.emitToProviders(
            nearbyProviders,
            "service:available",
            {
              orderId: newOrder._id,
              vehicleId: newOrder.vehicle._id,
              services: newOrder.services!,
              message: "A new service request is available nearby!",
            }
          );
        this._socketService.emitOrderUpdate(
          userId,
          { orderId: newOrder._id.toString(), status: "placed", message: "Your emergency order has been placed successfully!" }
        );
        await session.commitTransaction();
        return newOrder;
      } catch (error: any) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      throw error;
    }
  }
  async handleFailedEmergencyPayment(
    razorpayOrderId: string,
    paymentStatus: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    packageId: string,
    selectedAddressId:
      | string
      | {
          addressLine1: string;
          addressLine2?: string;
          city: string;
          latitude: number;
          longitude: number;
          state: string;
          zipCode: string;
        },
    userId: string
  ) {
    try {
      const user = await this._userRepository.findOne({ _id: userId });
      const servicePackage = await this._servicePackageRepository.findOne({
        _id: packageId,
      });
      if (!servicePackage) throw new Error("Service package not found");
      if (!user) throw new Error("User not found");

      const userSnapshot = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      };

      const servicesSnapshot = [
        {
          _id: servicePackage._id,
          title: servicePackage.title,
          description: servicePackage.description,
          priceBreakup: {
            parts: servicePackage.priceBreakup?.parts ?? [],
            laborCharge: servicePackage.priceBreakup?.laborCharge ?? 0,
            discount: servicePackage.priceBreakup?.discount ?? 0,
            tax: servicePackage.priceBreakup?.tax ?? 0,
            total: servicePackage.priceBreakup?.total ?? 0,
          },
          servicePackageCategory: "emergency",
        },
      ];

      const orderData = {
        user: userSnapshot,
        services: servicesSnapshot,
        totalAmount: servicePackage.priceBreakup?.total,
        finalAmount: servicePackage.priceBreakup?.total,
        paymentMethod: "online" as const,
        paymentStatus,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        orderStatus: "failed" as const,
        orderedAt: new Date(),
      };

      const newOrder = await this._orderRepository.create(orderData);

      if (!newOrder)
        throw new Error("Failed to record emergency failed payment");

      return newOrder._id.toString();
    } catch (error) {
      throw error;
    }
  }
 async handleEmergencyCashOrder(
  packageId: string,
  selectedAddressId:
    | string
    | {
        addressLine1: string;
        addressLine2?: string;
        city: string;
        latitude: number;
        longitude: number;
        state: string;
        zipCode: string;
      },
  userId: string
) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await this._userRepository.findOne({ _id: userId });
    const servicePackage = await this._servicePackageRepository.findOne({
      _id: packageId,
    });
    if (!servicePackage) throw new Error("Service package not found");
    if (!user) throw new Error("User not found");

    const userSnapshot = {
      _id: new Types.ObjectId(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    const servicesSnapshot = [
      {
        _id: servicePackage._id,
        title: servicePackage.title,
        description: servicePackage.description,
        priceBreakup: {
          parts: servicePackage.priceBreakup?.parts ?? [],
          laborCharge: servicePackage.priceBreakup?.laborCharge ?? 0,
          discount: servicePackage.priceBreakup?.discount ?? 0,
          tax: servicePackage.priceBreakup?.tax ?? 0,
          total: servicePackage.priceBreakup?.total ?? 0,
        },
        servicePackageCategory: "emergency",
      },
    ];

    let addressSnapshot: AddressSnapshot;
    if (typeof selectedAddressId === "string") {
      const addressDoc = await this._addressRepository.findOne({
        _id: new Types.ObjectId(selectedAddressId),
      });
      if (!addressDoc) throw new Error("Address not found");
      addressSnapshot = {
        _id: new Types.ObjectId(addressDoc._id),
        addressLine1: addressDoc.addressLine1,
        addressLine2: addressDoc.addressLine2 ?? "",
        city: addressDoc.city,
        state: addressDoc.state,
        zipCode: addressDoc.zipCode,
        location: addressDoc.location,
      };
    } else {
      addressSnapshot = {
        _id: undefined,
        addressLine1: selectedAddressId.addressLine1,
        addressLine2: selectedAddressId.addressLine2 || "",
        city: selectedAddressId.city,
        state: selectedAddressId.state,
        zipCode: selectedAddressId.zipCode,
        location: {
          type: "Point",
          coordinates: [selectedAddressId.latitude, selectedAddressId.longitude],
        },
      };
    }
    const orderData = {
      user: userSnapshot,
      vehicle: undefined,
      services: servicesSnapshot,
      totalAmount: servicePackage.priceBreakup?.total,
      finalAmount: servicePackage.priceBreakup?.total,
      paymentMethod: "cash" as const,
      paymentStatus: "pending" as const,
      orderStatus: "placed" as const,
      serviceDate: new Date().toISOString(),
      selectedSlot: "immediate",
      address: addressSnapshot,
      orderedAt: new Date(),
    };
    const newOrder = await this._orderRepository.create(orderData);
    if (!newOrder) throw new Error("Emergency order creation failed");
    const nearbyProviderIds = (await redis.georadius(
      "providers:locations",
      addressSnapshot.location.coordinates[0],
      addressSnapshot.location.coordinates[1],
      20,
      "km"
    )) as string[];

    const pipeline = redis.pipeline();
    for (const providerId of nearbyProviderIds) {
      pipeline.get(`provider:socket:${providerId}`);
    }
    const results = await pipeline.exec();

    const nearbyProviders: INearbyProvider[] = [];
    results?.forEach(([err, socketId], index) => {
      const providerId = nearbyProviderIds[index];
      nearbyProviders.push({
        providerId: new Types.ObjectId(providerId),
        socketId: typeof socketId === "string" ? socketId : undefined,
        status: "notified",
      });
    });
    await this._serviceRequestRepository.create(
      {
        userId: new Types.ObjectId(userId),
        orderId: new Types.ObjectId(newOrder._id),
        serviceType: "emergency",
        location: {
          lat: addressSnapshot.location.coordinates[0],
          lng: addressSnapshot.location.coordinates[1],
        },
        status: "pending",
        nearbyProviders,
      },
    );
    const notifications: Partial<INotification>[] = nearbyProviderIds.map(
      (providerId) => ({
        recipientId: new Types.ObjectId(providerId),
        recipientType: "provider",
        type: "service_request",
        message: "Emergency request nearby! 🚨",
        link: `/provider/orders/${newOrder._id}`,
        isRead: false,
        createdAt: new Date(),
      })
    );
    const userNotification: Partial<INotification> = {
      recipientId: new Types.ObjectId(userId),
      recipientType: "user",
      type: "order",
      message: "Your order has been placed successfully!",
      link: `/user/orders/${newOrder._id}`,
      isRead: false,
    };
    await this._notificationRepository.create(userNotification);
    await this._notificationRepository.insertMany(notifications);
   await this._socketService.emitToProviders(
            nearbyProviders,
            "service:available",
            {
              orderId: newOrder._id,
              vehicleId: newOrder.vehicle._id,
              services: newOrder.services!,
              message: "A new service request is available nearby!",
            }
          );
    this._socketService.emitOrderUpdate(
      userId,
      { orderId: newOrder._id.toString(), status: "placed", message: "Your emergency order has been placed successfully!" }
    );
    await session.commitTransaction();
    session.endSession();
    return newOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
}

