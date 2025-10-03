import { OrderDTO } from "../dtos/controllers/user/userOrder.controller.dto";
import { IOrder } from "../models/order.model"; // adjust your order model type

export function mapOrderToDTO(order: IOrder): OrderDTO {
  return {
    _id: order._id.toString(),
    user: {
      _id: order.user._id.toString(),
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phone,
    },
    vehicle: {
      _id: order.vehicle._id ? order.vehicle._id.toString() : "",
      brandId: order.vehicle.brandId ? order.vehicle.brandId.toString() : "",
      modelId: order.vehicle.modelId ? order.vehicle.modelId.toString() : "",
      brandName: order.vehicle.brandName,
      modelName: order.vehicle.modelName,
      fuel: order.vehicle.fuel,
    },
    services: (order.services ?? []).map((service: any) => ({
      _id: service._id ? service._id.toString() : "",
      title: service.title,
      description: service.description,
      fuelType: service.fuelType,
      servicePackageCategory: service.servicePackageCategory,
      priceBreakup: {
        parts: service.priceBreakup.parts.map((part: any) => ({
          name: part.name,
          price: part.price,
          quantity: part.quantity,
        })),
        laborCharge: service.priceBreakup.laborCharge,
        discount: service.priceBreakup.discount,
        tax: service.priceBreakup.tax,
        total: service.priceBreakup.total,
      },
    })),
    coupon: order.coupon
      ? {
          code: order.coupon.code,
          discountType: order.coupon.discountType,
          discountValue: order.coupon.discountValue,
          discountAmount: order.coupon.discountAmount,
          applied: order.coupon.applied,
        }
      : undefined,
    totalAmount: order.totalAmount,
    finalAmount: order.finalAmount,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId,
    razorpaySignature: order.razorpaySignature,
    serviceDate: order.serviceDate?.toString(),
    selectedSlot: order.selectedSlot,
    orderStatus: order.orderStatus,
    statusReason: order.statusReason,
    address: order.address && {
      _id: order.address?._id?.toString(),
      addressLine1: order.address.addressLine1,
      addressLine2: order.address.addressLine2,
      city: order.address.city,
      state: order.address.state,
      zipCode: order.address.zipCode,
      location: {
        type: order.address.location.type,
        coordinates: [
          order.address.location.coordinates[0],
          order.address.location.coordinates[1],
        ],
      },
    },
  };
}
