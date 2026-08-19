package com.adminpro.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Entity
@Table(name = "ticket")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Ticket number is required")
    @Size(max = 30)
    @Column(nullable = false, unique = true, length = 30)
    private String ticketNumber;

    @NotBlank(message = "Subject is required")
    @Size(max = 140)
    @Column(nullable = false, length = 140)
    private String subject;

    @NotBlank(message = "Requester is required")
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String requesterName;

    @Size(max = 140)
    @Column(length = 140)
    private String requesterEmail;

    @NotBlank(message = "Category is required")
    @Size(max = 60)
    @Column(nullable = false, length = 60)
    private String category;

    @NotBlank(message = "Priority is required")
    @Size(max = 20)
    @Column(nullable = false, length = 20)
    private String priority = "MEDIUM";

    @NotBlank(message = "Status is required")
    @Size(max = 20)
    @Column(nullable = false, length = 20)
    private String status = "NEW";

    @Size(max = 80)
    @Column(length = 80)
    private String assignee;

    @Size(max = 1000)
    @Column(length = 1000)
    private String description;

    @NotNull(message = "Created date is required")
    @Column(nullable = false)
    private LocalDate createdOn = LocalDate.now();

    public Ticket() {
    }

    public Ticket(String ticketNumber,
                  String subject,
                  String requesterName,
                  String requesterEmail,
                  String category,
                  String priority,
                  String status,
                  String assignee,
                  String description,
                  LocalDate createdOn) {
        this.ticketNumber = ticketNumber;
        this.subject = subject;
        this.requesterName = requesterName;
        this.requesterEmail = requesterEmail;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.assignee = assignee;
        this.description = description;
        this.createdOn = createdOn;
    }

    public Long getId() {
        return id;
    }

    public String getTicketNumber() {
        return ticketNumber;
    }

    public void setTicketNumber(String ticketNumber) {
        this.ticketNumber = ticketNumber;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAssignee() {
        return assignee;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getCreatedOn() {
        return createdOn;
    }

    public void setCreatedOn(LocalDate createdOn) {
        this.createdOn = createdOn;
    }
}