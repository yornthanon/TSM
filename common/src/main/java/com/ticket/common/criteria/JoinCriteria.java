package com.ticket.common.criteria;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Root;

public class JoinCriteria {

    private String joinEntity;
    private String propertyField;
    private Object jointValue;
    private SearchOperation searchOperation;

    public JoinCriteria() {
    }

    public JoinCriteria(String joinEntity, String propertyField, Object jointValue, SearchOperation searchOperation) {
        this.joinEntity = joinEntity;
        this.propertyField = propertyField;
        this.jointValue = jointValue;
        this.searchOperation = searchOperation;
    }

    public String getJoinEntity() {
        return joinEntity;
    }

    public void setJoinEntity(String joinEntity) {
        this.joinEntity = joinEntity;
    }

    public String getPropertyField() {
        return propertyField;
    }

    public void setPropertyField(String propertyField) {
        this.propertyField = propertyField;
    }

    public Object getJointValue() {
        return jointValue;
    }

    public void setJointValue(Object jointValue) {
        this.jointValue = jointValue;
    }

    public SearchOperation getSearchOperation() {
        return searchOperation;
    }

    public void setSearchOperation(SearchOperation searchOperation) {
        this.searchOperation = searchOperation;
    }

    public <T, R> Join<T, R> buildJoinCriteria(Root<T> root) {
        String firstSegment = joinEntity;
        if (joinEntity != null) {
            String[] parts = joinEntity.split("\\.");
            firstSegment = parts.length > 0 ? parts[0] : joinEntity;
        }
        return root.join(firstSegment, JoinType.INNER);
    }
}
