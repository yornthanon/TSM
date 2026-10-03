package com.ticket.userservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "oauth_login_codes")
@Getter
@Setter
@NoArgsConstructor
public class OAuthLoginCode {

    @Id
    @Column(name = "code_hash", nullable = false, length = 64)
    private String codeHash;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public OAuthLoginCode(String codeHash, Long userId, Instant expiresAt, Instant createdAt) {
        this.codeHash = codeHash;
        this.userId = userId;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }
}
