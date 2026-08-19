package com.ticket.orderservice.Mapper;

import com.ticket.orderservice.dto.OrderRequest;
import com.ticket.orderservice.dto.OrderResponse;
import com.ticket.orderservice.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Order toEntity(OrderRequest request);

    OrderResponse toResponse(Order order);
}