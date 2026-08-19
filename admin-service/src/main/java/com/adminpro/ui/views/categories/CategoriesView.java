package com.adminpro.ui.views.categories;

import com.adminpro.application.TicketCategoryService;
import com.adminpro.domain.TicketCategory;
import com.adminpro.ui.components.PageHeader;
import com.adminpro.ui.layout.MainLayout;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.confirmdialog.ConfirmDialog;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.grid.GridVariant;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.notification.NotificationVariant;
import com.vaadin.flow.component.select.Select;
import com.vaadin.flow.component.textfield.TextArea;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.data.binder.BeanValidationBinder;
import com.vaadin.flow.data.binder.ValidationException;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.PermitAll;

import java.util.Arrays;
import java.util.List;

@Route(value = "categories", layout = MainLayout.class)
@PageTitle("Categories | Ticket")
@PermitAll
public class CategoriesView extends Div {

    private static final List<String> STATUSES = List.of("ACTIVE", "INACTIVE");

    private final TicketCategoryService categoryService;

    private final Grid<TicketCategory> grid = new Grid<>(TicketCategory.class, false);
    private final TextField searchField = new TextField();
    private final Select<String> statusFilter = new Select<>();

    private final Span totalValue = new Span("0");
    private final Span activeValue = new Span("0");
    private final Span inactiveValue = new Span("0");

    public CategoriesView(TicketCategoryService categoryService) {
        this.categoryService = categoryService;
        addClassName("page-content");
        setWidthFull();

        PageHeader header = new PageHeader("Categories", "Organize tickets by topic");

        Button addButton = new Button("Add Category", VaadinIcon.PLUS.create());
        addButton.addClassNames("btn", "btn-primary");
        addButton.addClickListener(event -> openDialog(new TicketCategory()));

        header.addAction(addButton);

        add(header);
        add(buildStats());
        add(buildToolbar());
        add(buildGridCard());

        refreshSummary();
        refreshGrid();
    }

    private Div buildStats() {
        Div stats = new Div();
        stats.addClassNames("stats", "stats--three");
        stats.add(buildStat("Total", totalValue, "all categories", "neu"));
        stats.add(buildStat("Active", activeValue, "in use", "up"));
        stats.add(buildStat("Inactive", inactiveValue, "disabled", "neu"));
        return stats;
    }

    private Div buildStat(String label, Span value, String delta, String tone) {
        Div stat = new Div();
        stat.addClassName("stat");

        Span labelEl = new Span(label);
        labelEl.addClassName("stat-label");

        value.addClassName("stat-val");

        Span deltaEl = new Span(delta);
        deltaEl.addClassNames("stat-delta", tone);

        stat.add(labelEl, value, deltaEl);
        return stat;
    }

    private Div buildToolbar() {
        Div card = new Div();
        card.addClassNames("card", "toolbar-card");

        Div body = new Div();
        body.addClassNames("card-b", "toolbar-row");

        searchField.setPlaceholder("Search category");
        searchField.setPrefixComponent(VaadinIcon.SEARCH.create());
        searchField.setClearButtonVisible(true);
        searchField.addClassName("toolbar-search");
        searchField.addValueChangeListener(event -> refreshGrid());

        statusFilter.setLabel("Status");
        statusFilter.setItems(Arrays.asList("ALL", "ACTIVE", "INACTIVE"));
        statusFilter.setValue("ALL");
        statusFilter.addClassName("toolbar-select");
        statusFilter.addValueChangeListener(event -> refreshGrid());

        body.add(searchField, statusFilter);
        card.add(body);
        return card;
    }

    private Div buildGridCard() {
        grid.addThemeVariants(GridVariant.LUMO_NO_BORDER, GridVariant.LUMO_ROW_STRIPES);
        grid.addClassName("table-grid");
        grid.setWidthFull();

        grid.addColumn(TicketCategory::getName).setHeader("Category").setAutoWidth(true);
        grid.addColumn(TicketCategory::getDescription).setHeader("Description").setAutoWidth(true);
        grid.addComponentColumn(category -> buildStatusBadge(category.getStatus())).setHeader("Status").setAutoWidth(true);
        grid.addComponentColumn(this::buildRowActions).setHeader("").setAutoWidth(true).setFlexGrow(0);

        Div card = new Div();
        card.addClassName("card");

        Div body = new Div();
        body.addClassName("card-b");
        body.add(grid);

        card.add(body);
        return card;
    }

    private Span buildStatusBadge(String status) {
        Span badge = new Span(status);
        badge.addClassName("status-pill");

        if ("ACTIVE".equalsIgnoreCase(status)) {
            badge.addClassName("status-pill--green");
        } else {
            badge.addClassName("status-pill--gray");
        }
        return badge;
    }

    private Div buildRowActions(TicketCategory category) {
        Div actions = new Div();
        actions.addClassName("table-actions");

        Button manage = new Button("Manage");
        manage.addClassNames("btn", "btn-outline", "btn-sm");
        manage.addClickListener(event -> openDialog(category));

        Button delete = new Button("Delete");
        delete.addClassNames("btn", "btn-danger", "btn-sm");
        delete.addClickListener(event -> confirmDelete(category));

        actions.add(manage, delete);
        return actions;
    }

    private void openDialog(TicketCategory category) {
        boolean isNew = category.getId() == null;

        Dialog dialog = new Dialog();
        dialog.setHeaderTitle(isNew ? "Add Category" : "Edit Category");
        dialog.setWidth("480px");
        dialog.setCloseOnOutsideClick(false);

        TextField name = new TextField("Name");
        name.setWidthFull();

        TextArea description = new TextArea("Description");
        description.setWidthFull();

        Select<String> status = new Select<>();
        status.setLabel("Status");
        status.setItems(STATUSES);
        status.setWidthFull();

        Div form = new Div(name, description, status);
        form.getStyle().set("display", "grid").set("gap", "var(--lumo-space-s)");

        BeanValidationBinder<TicketCategory> binder = new BeanValidationBinder<>(TicketCategory.class);
        binder.forField(name).asRequired().bind(TicketCategory::getName, TicketCategory::setName);
        binder.forField(description).bind(TicketCategory::getDescription, TicketCategory::setDescription);
        binder.forField(status).asRequired().bind(TicketCategory::getStatus, TicketCategory::setStatus);
        binder.readBean(category);

        if (status.getValue() == null) {
            status.setValue("ACTIVE");
        }

        Button save = new Button(isNew ? "Create" : "Save");
        save.addClassNames("btn", "btn-primary");
        save.addClickListener(event -> {
            try {
                binder.writeBean(category);
                categoryService.save(category);
                dialog.close();
                refreshSummary();
                refreshGrid();
                notify(isNew ? "Category created." : "Category updated.", NotificationVariant.LUMO_SUCCESS);
            } catch (ValidationException ex) {
                notify("Please fix the highlighted errors.", NotificationVariant.LUMO_ERROR);
            } catch (Exception ex) {
                notify("Could not save category. Ensure the name is unique.", NotificationVariant.LUMO_ERROR);
            }
        });

        Button cancel = new Button("Cancel", event -> dialog.close());
        cancel.addClassNames("btn", "btn-outline");

        Div footer = new Div(cancel, save);
        footer.addClassName("dialog-footer");

        dialog.add(form);
        dialog.getFooter().add(footer);
        dialog.open();
    }

    private void confirmDelete(TicketCategory category) {
        ConfirmDialog confirm = new ConfirmDialog();
        confirm.setHeader("Delete category " + category.getName() + "?");
        confirm.setText("This action cannot be undone.");
        confirm.setCancelable(true);
        confirm.setConfirmText("Delete");
        confirm.setConfirmButtonTheme("error primary");
        confirm.addConfirmListener(event -> {
            categoryService.delete(category);
            refreshSummary();
            refreshGrid();
            notify("Category deleted.", NotificationVariant.LUMO_CONTRAST);
        });
        confirm.open();
    }

    private void refreshGrid() {
        List<TicketCategory> categories = categoryService.search(searchField.getValue());
        if (!"ALL".equalsIgnoreCase(statusFilter.getValue())) {
            categories = categories.stream()
                .filter(category -> statusFilter.getValue().equalsIgnoreCase(category.getStatus()))
                .toList();
        }
        grid.setItems(categories);
    }

    private void refreshSummary() {
        List<TicketCategory> categories = categoryService.findAll();
        totalValue.setText(String.valueOf(categories.size()));
        activeValue.setText(String.valueOf(categoryService.countByStatus("ACTIVE")));
        inactiveValue.setText(String.valueOf(categoryService.countByStatus("INACTIVE")));
    }

    private void notify(String message, NotificationVariant variant) {
        Notification notification = Notification.show(message, 3000, Notification.Position.BOTTOM_END);
        notification.addThemeVariants(variant);
    }
}