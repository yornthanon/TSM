package com.ticket.common.tenant;

/**
 * Request-scoped tenant identity. Callers must set and clear this context in a
 * finally block; never populate it directly from an untrusted request header.
 */
public final class TenantContextHolder {
    public static final String TENANT_HEADER = "X-Tenant-Id";
    private static final ThreadLocal<Scope> CURRENT = new ThreadLocal<>();

    private TenantContextHolder() {
    }

    public static void set(Long tenantId, boolean platformAdmin) {
        if (tenantId != null && tenantId <= 0) {
            throw new IllegalArgumentException("Tenant ID must be positive.");
        }
        CURRENT.set(new Scope(tenantId, platformAdmin));
    }

    public static Long getTenantId() {
        Scope scope = CURRENT.get();
        return scope == null ? null : scope.tenantId();
    }

    public static boolean isPlatformAdmin() {
        Scope scope = CURRENT.get();
        return scope != null && scope.platformAdmin();
    }

    public static boolean isSet() {
        return CURRENT.get() != null;
    }

    public static void clear() {
        CURRENT.remove();
    }

    private record Scope(Long tenantId, boolean platformAdmin) {
    }
}
