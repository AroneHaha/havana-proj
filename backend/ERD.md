TABLE: USERS
id                  UUID (PK)
first_name          STRING
last_name           STRING
email               STRING (unique)
password            STRING
phone               STRING (nullable)
role                STRING (admin/customer)
avatar              STRING (nullable)
email_verified_at   TIMESTAMP (nullable)
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP (nullable)


TABLE: CATEGORIES
id                  UUID (PK)
name_en             STRING
name_ar             STRING
slug                STRING (unique)
image               STRING (nullable)
is_active           BOOLEAN (default: true)
sort_order          INTEGER (default: 0)
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP (nullable)


TABLE: PRODUCTS
id                  UUID (PK)
category_id         UUID (FK → CATEGORIES.id)
name_en             STRING
name_ar             STRING
description_en      TEXT
description_ar      TEXT
slug                STRING (unique)
price               DECIMAL(10,3)
sale_price          DECIMAL(10,3) (nullable)
image               STRING
images              JSON (nullable)
sku                 STRING (nullable, unique)
stock               INTEGER (default: 0)
rating              DECIMAL(2,1) (default: 0.0)
is_featured         BOOLEAN (default: false)
is_best_seller      BOOLEAN (default: false)
is_new              BOOLEAN (default: false)
is_active           BOOLEAN (default: true)
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP (nullable)


TABLE: CART_ITEMS
id                  UUID (PK)
user_id             UUID (FK → USERS.id)
product_id          UUID (FK → PRODUCTS.id)
quantity            INTEGER (default: 1)
created_at          TIMESTAMP
updated_at          TIMESTAMP


TABLE: REVIEWS
id                  UUID (PK)
product_id          UUID (FK → PRODUCTS.id)
user_id             UUID (FK → USERS.id)
rating              INTEGER (1-5)
title               STRING (nullable)
comment             TEXT
visibility          STRING (visible/hidden/pending, default: pending)
created_at          TIMESTAMP
updated_at          TIMESTAMP


TABLE: ORDERS
id                  UUID (PK)
user_id             UUID (FK → USERS.id)
order_number        STRING (unique)
status              STRING (default: pending)
subtotal            DECIMAL(10,3)
shipping_cost       DECIMAL(10,3) (default: 0)
discount            DECIMAL(10,3) (default: 0)
total               DECIMAL(10,3)
payment_method      STRING (cash/card/online)
payment_status      STRING (default: pending)
shipping_address    TEXT
shipping_phone      STRING
notes               TEXT (nullable)
confirmed_at        TIMESTAMP (nullable)
delivered_at        TIMESTAMP (nullable)
cancelled_at        TIMESTAMP (nullable)
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP (nullable)


TABLE: ORDER_ITEMS
id                  UUID (PK)
order_id            UUID (FK → ORDERS.id)
product_id          UUID (FK → PRODUCTS.id)
product_name        STRING
product_image       STRING
price               DECIMAL(10,3)
quantity            INTEGER
created_at          TIMESTAMP
updated_at          TIMESTAMP


TABLE: ORDER_STATUS_HISTORY
id                  UUID (PK)
order_id            UUID (FK → ORDERS.id)
status              STRING
changed_by          UUID (FK → USERS.id, nullable)
note                TEXT (nullable)
created_at          TIMESTAMP


TABLE: DELIVERY_ADDRESSES
id                  UUID (PK)
user_id             UUID (FK → USERS.id)
full_address        STRING
area                STRING
block               STRING
street              STRING
building            STRING
floor               STRING (nullable)
apartment           STRING (nullable)
latitude            DECIMAL(10,3) (nullable)
longitude           DECIMAL(10,3) (nullable)
is_default          BOOLEAN (default: false)
created_at          TIMESTAMP
updated_at          TIMESTAMP


TABLE: NOTIFICATIONS
id                  UUID (PK)
user_id             UUID (FK → USERS.id, nullable)
type                STRING (order_placed/order_confirmed/order_shipped/order_delivered/order_cancelled/low_stock/new_review/review_hidden/system)
title_en            STRING
title_ar            STRING
body_en             TEXT
body_ar             TEXT
data                JSON (nullable)
is_read             BOOLEAN (default: false)
read_at             TIMESTAMP (nullable)
created_at          TIMESTAMP
updated_at          TIMESTAMP


TABLE: PASSWORD_RESETS
email               STRING (PK)
token               STRING
created_at          TIMESTAMP


TABLE: WISHLIST
id                  UUID (PK)
user_id             UUID (FK → USERS.id)
product_id          UUID (FK → PRODUCTS.id)
created_at          TIMESTAMP