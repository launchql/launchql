-- Exported from QuickDBD: https://www.quickdatatabasediagrams.com/
-- NOTE! If you have used non-SQL datatypes in your design, you will have to change these here.

-- Modify this code to update the DB schema diagram.
-- To reset the sample schema, replace everything with
-- two dots ('..' - without quotes).

CREATE TABLE "Customer" (
    "CustomerID" int   NOT NULL,
    "Name" string   NOT NULL,
    "Address1" string   NOT NULL,
    "Address2" string   NULL,
    "Address3" string   NULL,
    CONSTRAINT "pk_Customer" PRIMARY KEY (
        "CustomerID"
     )
);

CREATE TABLE "Order" (
    "OrderID" int   NOT NULL,
    "CustomerID" int   NOT NULL,
    "TotalAmount" money   NOT NULL,
    "OrderStatusID" int   NOT NULL,
    CONSTRAINT "pk_Order" PRIMARY KEY (
        "OrderID"
     )
);

CREATE TABLE "OrderLine" (
    "OrderLineID" int   NOT NULL,
    "OrderID" int   NOT NULL,
    "ProductID" int   NOT NULL,
    "Quantity" int   NOT NULL,
    CONSTRAINT "pk_OrderLine" PRIMARY KEY (
        "OrderLineID"
     )
);

-- Table documentation comment 1 (try the PDF/RTF export)
-- Table documentation comment 2
CREATE TABLE "Product" (
    "ProductID" int   NOT NULL,
    -- Field documentation comment 1
    -- Field documentation comment 2
    -- Field documentation comment 3
    "Name" varchar(200)   NOT NULL,
    "Price" money   NOT NULL,
    CONSTRAINT "pk_Product" PRIMARY KEY (
        "ProductID"
     ),
    CONSTRAINT "uc_Product_Name" UNIQUE (
        "Name"
    )
);

CREATE TABLE "OrderStatus" (
    "OrderStatusID" int   NOT NULL,
    "Name" string   NOT NULL,
    CONSTRAINT "pk_OrderStatus" PRIMARY KEY (
        "OrderStatusID"
     ),
    CONSTRAINT "uc_OrderStatus_Name" UNIQUE (
        "Name"
    )
);

ALTER TABLE "Order" ADD CONSTRAINT "fk_Order_CustomerID" FOREIGN KEY("CustomerID")
REFERENCES "Customer" ("CustomerID");

ALTER TABLE "Order" ADD CONSTRAINT "fk_Order_OrderStatusID" FOREIGN KEY("OrderStatusID")
REFERENCES "os" ("OrderStatusID");

ALTER TABLE "OrderLine" ADD CONSTRAINT "fk_OrderLine_OrderID" FOREIGN KEY("OrderID")
REFERENCES "Order" ("OrderID");

ALTER TABLE "OrderLine" ADD CONSTRAINT "fk_OrderLine_ProductID" FOREIGN KEY("ProductID")
REFERENCES "p" ("ProductID");

CREATE INDEX "idx_Customer_Name"
ON "Customer" ("Name");

