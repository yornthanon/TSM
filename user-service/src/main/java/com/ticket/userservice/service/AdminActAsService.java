package com.ticket.userservice.service;

import com.ticket.userservice.dto.response.ActAsAuditResponse;
import com.ticket.userservice.dto.response.ActAsResponse;
import com.ticket.userservice.entity.CustomUserDetail;
import com.ticket.userservice.entity.TenantWorkspace;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.repository.TenantWorkspaceRepository;
import com.ticket.userservice.repository.UserRepository;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminActAsService {
    private static final long SESSION_MINUTES = 15;

    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final TenantWorkspaceRepository workspaceRepository;
    private final CustomUserDetailService userDetailService;
    private final JwtService jwtService;

    @Value("${app.auth.platform-admin-emails:}")
    private String platformAdminEmails;

    @Transactional
    public ActAsResponse start(Long targetUserId, Authentication authentication) {
        User actor = requirePlatformAdmin(authentication);
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user was not found."));
        if (target.getId().equals(actor.getId()) || isAllowlistedEmail(target.getEmail())
                || target.getRoles().stream().anyMatch(role -> "ADMIN".equals(role.getName()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Platform administrator accounts cannot be impersonated.");
        }
        if (!"ACTIVE".equalsIgnoreCase(target.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only active accounts can be selected.");
        }
        if (!StringUtils.hasText(target.getEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "The target account has no verified email identity.");
        }
        Long tenantId = target.getTenantId();
        TenantWorkspace workspace = tenantId == null ? null : workspaceRepository.findById(tenantId).orElse(null);
        if (workspace == null || !"ACTIVE".equalsIgnoreCase(workspace.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "The target account has no active workspace.");
        }

        CustomUserDetail targetPrincipal = userDetailService.customUserDetail(target.getUsername());
        if (targetPrincipal.getAuthorities().stream().anyMatch(authority -> "ADMIN".equals(authority.getAuthority()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Platform administrator accounts cannot be impersonated.");
        }

        Instant now = Instant.now();
        Instant expiresAt = now.plus(SESSION_MINUTES, ChronoUnit.MINUTES);
        Long sessionId = jdbcTemplate.queryForObject(
                "INSERT INTO admin_act_as_sessions (actor_user_id, actor_email, target_user_id, target_email, tenant_id, started_at, expires_at, status) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE') RETURNING id",
                Long.class,
                actor.getId(), actor.getEmail(), target.getId(), target.getEmail(), tenantId,
                Timestamp.from(now), Timestamp.from(expiresAt));
        if (sessionId == null) {
            throw new IllegalStateException("Act-as session could not be created.");
        }
        insertAudit(sessionId, actor, target, "SESSION_STARTED", "POST",
                "/api/v1/admin/act-as/users/" + targetUserId, HttpStatus.OK.value());

        String accessToken = jwtService.generateActAsToken(targetPrincipal, actor.getId(), sessionId, expiresAt);
        List<String> roles = targetPrincipal.getAuthorities().stream()
                .map(authority -> authority.getAuthority()).sorted().toList();
        ActAsResponse.TargetUser targetSummary = new ActAsResponse.TargetUser(
                target.getId(), target.getUsername(), target.getEmail(), target.getFirstName(), target.getLastName(),
                tenantId, roles);
        return new ActAsResponse(accessToken, sessionId, expiresAt, targetSummary);
    }

    @Transactional
    public void stop(Long sessionId, Authentication authentication) {
        User actor = requirePlatformAdmin(authentication);
        Map<String, Object> row = jdbcTemplate.query(
                "SELECT actor_user_id, actor_email, target_user_id, target_email FROM admin_act_as_sessions WHERE id = ? FOR UPDATE",
                rs -> rs.next() ? Map.of(
                        "actorUserId", rs.getLong("actor_user_id"),
                        "actorEmail", rs.getString("actor_email"),
                        "targetUserId", rs.getLong("target_user_id"),
                        "targetEmail", rs.getString("target_email")) : null,
                sessionId);
        if (row == null || !actor.getId().equals(((Number) row.get("actorUserId")).longValue())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Act-as session was not found.");
        }
        int changed = jdbcTemplate.update(
                "UPDATE admin_act_as_sessions SET status = 'ENDED', ended_at = now() WHERE id = ? AND status = 'ACTIVE'",
                sessionId);
        if (changed > 0) {
            insertAudit(sessionId, actor.getId(), (String) row.get("actorEmail"),
                    ((Number) row.get("targetUserId")).longValue(), (String) row.get("targetEmail"),
                    "SESSION_ENDED", "POST", "/api/v1/admin/act-as/" + sessionId + "/stop", HttpStatus.OK.value());
        }
    }

    @Transactional(readOnly = true)
    public ActAsContext validate(Long sessionId, Long actorUserId, String targetUsername) {
        List<ActAsContext> rows = jdbcTemplate.query(
                "SELECT s.id, s.actor_user_id, s.actor_email, s.target_user_id, s.target_email, s.tenant_id "
                        + "FROM admin_act_as_sessions s JOIN users u ON u.id = s.target_user_id "
                        + "WHERE s.id = ? AND s.actor_user_id = ? AND s.status = 'ACTIVE' "
                        + "AND s.expires_at > now() AND u.username = ?",
                (rs, rowNum) -> new ActAsContext(rs.getLong("id"), rs.getLong("actor_user_id"),
                        rs.getString("actor_email"), rs.getLong("target_user_id"),
                        rs.getString("target_email"), rs.getLong("tenant_id")),
                sessionId, actorUserId, targetUsername);
        ActAsContext context = rows.isEmpty() ? null : rows.get(0);
        if (context == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Act-as session is no longer active.");
        }
        User actor = userRepository.findById(context.actorUserId()).orElse(null);
        User target = userRepository.findById(context.targetUserId()).orElse(null);
        if (!isPlatformAdmin(actor) || target == null
                || !"ACTIVE".equalsIgnoreCase(target.getStatus())
                || !context.tenantId().equals(target.getTenantId())
                || isAllowlistedEmail(target.getEmail())
                || target.getRoles().stream().anyMatch(role -> "ADMIN".equals(role.getName()))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Act-as session is no longer valid.");
        }
        if (!context.actorEmail().equalsIgnoreCase(actor.getEmail())
                || !context.targetEmail().equalsIgnoreCase(target.getEmail())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account identity changed; start a new act-as session.");
        }
        return context;
    }

    @Transactional
    public void recordRequest(ActAsContext context, String method, String path, int status) {
        String action = switch (method.toUpperCase(Locale.ROOT)) {
            case "GET", "HEAD" -> "READ";
            case "POST" -> "CREATE_OR_ACTION";
            case "PUT", "PATCH" -> "UPDATE";
            case "DELETE" -> "DELETE";
            default -> "REQUEST";
        };
        insertAudit(context, action, method, path, status);
    }

    @Transactional(readOnly = true)
    public List<ActAsAuditResponse> recentAudit(Authentication authentication) {
        requirePlatformAdmin(authentication);
        return jdbcTemplate.query(
                "SELECT id, session_id, actor_user_id, actor_email, target_user_id, target_email, action, "
                        + "http_method, request_path, response_status, occurred_at "
                        + "FROM admin_act_as_audit ORDER BY occurred_at DESC LIMIT 100",
                (rs, rowNum) -> new ActAsAuditResponse(
                        rs.getLong("id"), rs.getLong("session_id"), rs.getLong("actor_user_id"),
                        rs.getString("actor_email"), rs.getLong("target_user_id"), rs.getString("target_email"),
                        rs.getString("action"), rs.getString("http_method"), rs.getString("request_path"),
                        (Integer) rs.getObject("response_status"), rs.getTimestamp("occurred_at").toInstant()));
    }

    private User requirePlatformAdmin(Authentication authentication) {
        String username = authentication == null ? null : authentication.getName();
        User actor = StringUtils.hasText(username) ? userRepository.findByUsername(username) : null;
        if (!isPlatformAdmin(actor)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the allowlisted platform CEO can use act-as.");
        }
        return actor;
    }

    private boolean isPlatformAdmin(User user) {
        return user != null && "ACTIVE".equalsIgnoreCase(user.getStatus()) && isAllowlistedEmail(user.getEmail());
    }

    private boolean isAllowlistedEmail(String email) {
        if (!StringUtils.hasText(email) || !StringUtils.hasText(platformAdminEmails)) return false;
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        return Arrays.stream(platformAdminEmails.split(","))
                .map(String::trim).filter(StringUtils::hasText)
                .map(value -> value.toLowerCase(Locale.ROOT)).anyMatch(normalized::equals);
    }

    private void insertAudit(Long sessionId, User actor, User target, String action,
                             String method, String path, int status) {
        insertAudit(sessionId, actor.getId(), actor.getEmail(), target.getId(), target.getEmail(), action, method, path, status);
    }

    private void insertAudit(ActAsContext context, String action, String method, String path, int status) {
        insertAudit(context.sessionId(), context.actorUserId(), context.actorEmail(), context.targetUserId(),
                context.targetEmail(), action, method, path, status);
    }

    private void insertAudit(Long sessionId, Long actorId, String actorEmail, Long targetId, String targetEmail,
                             String action, String method, String path, int status) {
        jdbcTemplate.update(
                "INSERT INTO admin_act_as_audit (session_id, actor_user_id, actor_email, target_user_id, target_email, action, http_method, request_path, response_status) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                sessionId, actorId, actorEmail, targetId, targetEmail, action, method, safePath(path), status);
    }

    private String safePath(String path) {
        if (path == null) return null;
        path = path.replaceAll("(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}", "{email}");
        return path.length() <= 512 ? path : path.substring(0, 512);
    }

    public record ActAsContext(Long sessionId, Long actorUserId, String actorEmail,
                               Long targetUserId, String targetEmail, Long tenantId) {
    }
}
