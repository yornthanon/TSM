package com.ticket.common.criteria;

import jakarta.persistence.criteria.Join;
public class JoinCriteria<T, R> {

    private final Join<T, R> join;
    private final BaseSearchCriteria<R> searchCriteria;

    public JoinCriteria(Join<T, R> join, BaseSearchCriteria<R> searchCriteria) {
        this.join = join;
        this.searchCriteria = searchCriteria;
    }

    public Join<T, R> getJoin() {
        return join;
    }

    public BaseSearchCriteria<R> getSearchCriteria(SearchOperation equal) {
        return searchCriteria;
    }

    public void setJoinEntity(String roles) {
    }

    public void setPropertyField(String name) {
    }
}
