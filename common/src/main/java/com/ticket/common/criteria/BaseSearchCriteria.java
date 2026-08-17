package com.ticket.common.criteria;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import java.util.ArrayList;
import java.util.List;

public class BaseSearchCriteria<T> {

    private final Root<T> root;
    private final CriteriaQuery<?> query;
    private final CriteriaBuilder criteriaBuilder;
    private final List<Predicate> predicates = new ArrayList<>();

    public BaseSearchCriteria(Root<T> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) {
        this.root = root;
        this.query = query;
        this.criteriaBuilder = criteriaBuilder;
    }

    public void addCriteria(SearchCriteria searchCriteria) {
        switch (searchCriteria.getOperation()) {
            case EQUAL:
                predicates.add(criteriaBuilder.equal(root.get(searchCriteria.getKey()), searchCriteria.getValue()));
                break;
            case NOT_EQUAL:
                predicates.add(criteriaBuilder.notEqual(root.get(searchCriteria.getKey()), searchCriteria.getValue()));
                break;
            case LIKE:
                predicates.add(criteriaBuilder.like(root.get(searchCriteria.getKey()), "%" + searchCriteria.getValue() + "%"));
                break;
            case GREATER_THAN:
                predicates.add(criteriaBuilder.greaterThan(root.get(searchCriteria.getKey()), (Comparable) searchCriteria.getValue()));
                break;
            case LESS_THAN:
                predicates.add(criteriaBuilder.lessThan(root.get(searchCriteria.getKey()), (Comparable) searchCriteria.getValue()));
                break;
            case GREATER_THAN_EQUAL:
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get(searchCriteria.getKey()), (Comparable) searchCriteria.getValue()));
                break;
            case LESS_THAN_EQUAL:
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get(searchCriteria.getKey()), (Comparable) searchCriteria.getValue()));
                break;
            case IN:
                predicates.add(root.get(searchCriteria.getKey()).in(searchCriteria.getValue()));
                break;
            case BETWEEN:
                Object[] values = (Object[]) searchCriteria.getValue();
                predicates.add(criteriaBuilder.between(root.get(searchCriteria.getKey()), (Comparable) values[0], (Comparable) values[1]));
                break;
        }
    }

    public Predicate getPredicate() {
        return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
    }
}
