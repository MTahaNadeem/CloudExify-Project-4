# Deployment Checklist

Follow these exact steps to push your local `restaurant-app` to production on Vercel and wire it up securely with Supabase.

## 1. Push to GitHub
1. Open your terminal in the `restaurant-app` project folder.
2. Ensure all your changes are committed and pushed to your `MTahaNadeem/CloudExify-Project-4` repository:
   ```bash
   git add .
   git commit -m "Final pre-deployment polish"
   git push origin main
   ```

## 2. Deploy on Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** > **Project**.
3. Locate your `CloudExify-Project-4` repository in the GitHub list and click **Import**.
4. In the "Configure Project" screen:
   - **Framework Preset**: Make sure this is set to **Other**.
   - **Root Directory**: If your app is inside the `restaurant-app` subfolder, click **Edit** and select the `restaurant-app` folder. If the HTML files are in the very root of the repo, leave it as `./`.
5. Click **Deploy**. Vercel will build and assign you a live URL (e.g., `https://your-app.vercel.app`).
6. Copy this deployed URL to your clipboard.

## 3. Configure Supabase Authentication URLs
Supabase will block logins and registrations if they originate from an untrusted domain. We must whitelist your new Vercel URL.
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **Authentication** > **URL Configuration**.
3. Under **Site URL**, paste your deployed Vercel URL (e.g., `https://your-app.vercel.app`).
4. Under **Redirect URLs**, click **Add URL**, paste your Vercel URL again, and add `/*` to the end of it (e.g., `https://your-app.vercel.app/*`). This allows redirects to any page on your site.
5. Click **Save**.

## 4. End-to-End Production Test
Open an **Incognito/Private** browsing window and navigate to your deployed Vercel URL. Complete the following test flow:

- [ ] **Register**: Create a brand new customer account.
- [ ] **Login**: Log out and log back in to ensure session persistence works.
- [ ] **Order**: Add items to your cart and place an order. Verify the success toast appears and the cart clears.
- [ ] **Admin Status Update**: Log in with your Admin account, navigate to the Admin Dashboard, and change the status of the new order from "Pending" to "Preparing". Verify the success toast appears and the dropdown updates permanently.

If all steps pass, your Cafe & Bakery web app is officially production-ready!
