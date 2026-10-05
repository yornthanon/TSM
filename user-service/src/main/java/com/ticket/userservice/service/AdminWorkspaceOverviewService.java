package com.ticket.userservice.service;

import com.ticket.userservice.dto.response.AdminWorkspaceOverviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminWorkspaceOverviewService {
    private final JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<AdminWorkspaceOverviewResponse> listWorkspaceTotals() {
        return jdbcTemplate.query(
                "SELECT tw.id AS workspace_id, tw.name AS workspace_name, tw.status AS workspace_status, "
                        + "owner_user.id AS owner_user_id, owner_user.email AS owner_email, owner_user.username AS owner_username, "
                        + "(SELECT COUNT(*) FROM users u WHERE u.tenant_id = tw.id) AS user_count, "
                        + "(SELECT COUNT(*) FROM event e WHERE e.tenant_id = tw.id) AS event_count, "
                        + "(SELECT COUNT(*) FROM tt_ticket t WHERE t.tenant_id = tw.id) AS ticket_count, "
                        + "(SELECT COUNT(*) FROM tt_order o WHERE o.tenant_id = tw.id) AS order_count, "
                        + "(SELECT COALESCE(SUM(o.amount), 0) FROM tt_order o WHERE o.tenant_id = tw.id) AS order_amount, "
                        + "(SELECT COUNT(*) FROM tt_payment p WHERE p.tenant_id = tw.id) AS payment_count, "
                        + "(SELECT COALESCE(SUM(p.amount), 0) FROM tt_payment p WHERE p.tenant_id = tw.id AND p.payment_status = 'COMPLETED') AS completed_payment_amount, "
                        + "(SELECT COUNT(*) FROM tt_notification n WHERE n.tenant_id = tw.id) AS notification_count "
                        + "FROM tenant_workspaces tw LEFT JOIN users owner_user ON owner_user.id = tw.owner_user_id "
                        + "ORDER BY tw.id",
                (rs, rowNum) -> new AdminWorkspaceOverviewResponse(
                        rs.getLong("workspace_id"), rs.getString("workspace_name"), rs.getString("workspace_status"),
                        rs.getObject("owner_user_id", Long.class), rs.getString("owner_email"), rs.getString("owner_username"),
                        rs.getLong("user_count"), rs.getLong("event_count"), rs.getLong("ticket_count"),
                        rs.getLong("order_count"), zeroIfNull(rs.getBigDecimal("order_amount")),
                        rs.getLong("payment_count"), zeroIfNull(rs.getBigDecimal("completed_payment_amount")),
                        rs.getLong("notification_count")));
    }

    private BigDecimal zeroIfNull(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }
}
