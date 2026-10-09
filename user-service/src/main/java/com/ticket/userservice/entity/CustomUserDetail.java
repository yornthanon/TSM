package com.ticket.userservice.entity;

import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@NoArgsConstructor
public class CustomUserDetail implements UserDetails {
    private String username;
    private String password;
    private List<GrantedAuthority> authorities;
    private Long tenantId;
    private Set<Long> accessibleTenantIds = new LinkedHashSet<>();

    public CustomUserDetail(String username, String password, List<GrantedAuthority> authorities) {
        this(username, password, authorities, null, new LinkedHashSet<>());
    }

    public CustomUserDetail(String username, String password, List<GrantedAuthority> authorities, Long tenantId) {
        this(username, password, authorities, tenantId, new LinkedHashSet<>());
    }

    public CustomUserDetail(String username, String password, List<GrantedAuthority> authorities,
                            Long tenantId, Set<Long> accessibleTenantIds) {
        this.username = username;
        this.password = password;
        this.authorities = authorities;
        this.tenantId = tenantId;
        this.accessibleTenantIds = accessibleTenantIds == null
                ? new LinkedHashSet<>() : new LinkedHashSet<>(accessibleTenantIds);
    }

    public Long getTenantId() {
        return tenantId;
    }

    public Set<Long> getAccessibleTenantIds() {
        return Set.copyOf(accessibleTenantIds);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
