package com.ticket.userservice.repository;

import com.ticket.userservice.entity.OAuthLoginCode;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface OAuthLoginCodeRepository extends JpaRepository<OAuthLoginCode, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select code from OAuthLoginCode code where code.codeHash = :codeHash")
    Optional<OAuthLoginCode> findByCodeHashForUpdate(@Param("codeHash") String codeHash);

    @Modifying
    @Query("delete from OAuthLoginCode code where code.expiresAt < :now")
    int deleteExpired(@Param("now") Instant now);

    long deleteAllByUserId(Long userId);
}
