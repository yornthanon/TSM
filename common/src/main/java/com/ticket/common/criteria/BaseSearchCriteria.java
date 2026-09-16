package com.ticket.common.criteria;

import java.util.ArrayList;
import java.util.List;

public class BaseSearchCriteria {

    private final List<SearchCriteria> searchCriteria = new ArrayList<>();
    private final List<SearchCriteria> searchOrCriteria = new ArrayList<>();
    private final List<JoinCriteria> joinCriteria = new ArrayList<>();

    public BaseSearchCriteria() {
    }

    public void addCriteria(SearchCriteria criteria) {
        if (criteria != null) {
            searchCriteria.add(criteria);
        }
    }

    public void addOrCriteria(SearchCriteria criteria) {
        if (criteria != null) {
            searchOrCriteria.add(criteria);
        }
    }

    public void addJoin(JoinCriteria criteria) {
        if (criteria != null) {
            joinCriteria.add(criteria);
        }
    }

    public List<SearchCriteria> getSearchCriteria() {
        return searchCriteria;
    }

    public List<SearchCriteria> getSearchOrCriteria() {
        return searchOrCriteria;
    }

    public List<JoinCriteria> getJoinCriteria() {
        return joinCriteria;
    }
}
