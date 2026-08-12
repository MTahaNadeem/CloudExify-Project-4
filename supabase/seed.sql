-- Seed data for menu_items (Cafe & Bakery)
insert into menu_items (name, description, price, category, image_url, available) values
  ('Espresso', 'Rich and bold single shot of our signature house blend espresso.', 2.50, 'Coffee', 'assets/espresso.jpg', true),
  ('Cappuccino', 'Classic Italian cappuccino with equal parts espresso, steamed milk, and milk foam.', 4.00, 'Coffee', 'assets/cappuccino.jpg', true),
  ('Latte', 'Smooth espresso balanced with generous steamed milk and a light layer of foam.', 4.50, 'Coffee', 'assets/latte.jpg', true),
  ('Mocha', 'Espresso layered with rich chocolate syrup and steamed milk, topped with whipped cream.', 5.00, 'Coffee', 'assets/mocha.jpg', true),
  ('Iced Caramel Macchiato', 'Chilled espresso poured over milk and vanilla syrup, finished with a caramel drizzle.', 5.50, 'Cold Drinks', 'assets/iced-caramel-macchiato.jpg', true),
  ('Cold Brew', 'Slow-steeped cold brew coffee, smooth and highly caffeinated.', 4.25, 'Cold Drinks', 'assets/cold-brew.jpg', true),
  ('Classic Croissant', 'Flaky, buttery, freshly baked French croissant.', 3.50, 'Pastries', 'assets/croissant.jpg', true),
  ('Pain au Chocolat', 'Buttery croissant dough wrapped around two sticks of dark chocolate.', 4.00, 'Pastries', 'assets/pain-au-chocolat.jpg', true),
  ('Blueberry Muffin', 'Soft and fluffy muffin bursting with fresh blueberries and topped with streusel.', 3.75, 'Pastries', 'assets/blueberry-muffin.jpg', true),
  ('Cinnamon Roll', 'Warm, gooey cinnamon roll topped with rich cream cheese icing.', 4.50, 'Pastries', 'assets/cinnamon-roll.jpg', true),
  ('Avocado Toast', 'Smashed avocado on toasted sourdough with cherry tomatoes, radish, and microgreens.', 8.50, 'Food', 'assets/avocado-toast.jpg', true),
  ('Turkey & Brie Sandwich', 'Roasted turkey breast, creamy brie, and fig jam on a toasted baguette.', 9.50, 'Food', 'assets/turkey-brie.jpg', true),
  ('Caprese Panini', 'Fresh mozzarella, sliced tomatoes, and basil pesto grilled on artisan ciabatta.', 9.00, 'Food', 'assets/caprese-panini.jpg', true),
  ('Matcha Green Tea Latte', 'Premium grade matcha powder whisked with perfectly steamed milk.', 5.00, 'Tea', 'assets/matcha-latte.jpg', true),
  ('Earl Grey Tea', 'A fragrant black tea blended with the distinct citrus notes of bergamot.', 3.00, 'Tea', 'assets/earl-grey.jpg', true);
