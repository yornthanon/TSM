package com.ticket.common.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class APIResponse<T> {
    private Boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;

}
