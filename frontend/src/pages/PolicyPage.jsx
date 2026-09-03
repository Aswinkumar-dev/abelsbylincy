import React from 'react';
import { useSearchParams } from 'react-router-dom';

export default function PolicyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'privacy';

  const d = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentDateStr = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'shipping', label: 'Shipping & Delivery' },
    { id: 'refunds', label: 'Returns & Refunds' },
  ];

  const contentMap = {
    privacy: {
      title: 'Privacy Policy',
      html: `
        <div style="font-family: var(--font-sans); color: var(--slate); font-size: 14px; line-height: 1.7;">
          <p style="margin-bottom: 24px; font-style: italic; font-size: 13px;">Last updated: ${currentDateStr}</p>
          <p style="margin-bottom: 20px;">At Abel's by Lincy, accessible from <a href="https://abelsbylincy.com" target="_blank" style="color: var(--gold); text-decoration: underline;">abelsbylincy.com</a>, we respect your privacy and are committed to protecting the personal information you provide to us.</p>
          <p style="margin-bottom: 20px;">This Privacy Policy explains what personal information we collect, how we collect it, why we use it, when we may share it, how we protect it, and the choices you have regarding your information.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">1. About Us</h3>
          <p style="margin-bottom: 4px;">Abel's by Lincy</p>
          <p style="margin-bottom: 4px;">Email: <a href="mailto:lincytitus8@gmail.com" style="color: var(--gold); font-weight: 600;">lincytitus8@gmail.com</a></p>
          <p style="margin-bottom: 4px;">Phone: +61 435 927 824</p>
          <p style="margin-bottom: 16px;">Website: <a href="https://abelsbylincy.com" target="_blank" style="color: var(--gold); text-decoration: underline;">abelsbylincy.com</a></p>
          <p style="margin-bottom: 16px;">For privacy-related questions or requests, you can contact us using the details above.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">2. Information We Collect</h3>
          <p style="margin-bottom: 8px;">We may collect personal information that you provide directly to us when you use our Website, create an account, place an order, contact us or otherwise interact with our business.</p>
          <p style="margin-bottom: 8px;">Depending on how you use our Website, this may include:</p>
          <ul style="margin-bottom: 16px; padding-left: 24px;">
            <li style="margin-bottom: 5px;">Full name</li>
            <li style="margin-bottom: 5px;">Email address</li>
            <li style="margin-bottom: 5px;">Phone number</li>
            <li style="margin-bottom: 5px;">Billing address</li>
            <li style="margin-bottom: 5px;">Delivery address</li>
            <li style="margin-bottom: 5px;">Account information</li>
            <li style="margin-bottom: 5px;">Order history</li>
            <li style="margin-bottom: 5px;">Product preferences</li>
            <li style="margin-bottom: 5px;">Customer service enquiries</li>
            <li style="margin-bottom: 5px;">Information you provide when contacting us</li>
            <li style="margin-bottom: 5px;">Marketing preferences</li>
            <li style="margin-bottom: 5px;">Information relating to returns, refunds or exchanges</li>
          </ul>
          <p style="margin-bottom: 16px;">We may also collect information automatically when you browse or use our Website, such as your IP address, browser type, device information, pages visited and general Website usage information.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">3. Information You Provide During Checkout</h3>
          <p style="margin-bottom: 8px;">When you place an order, we collect the information necessary to process and deliver your purchase.</p>
          <p style="margin-bottom: 16px;">This may include your name, contact details, delivery address, billing information, order details and other information required to fulfil your order.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">4. Account Information</h3>
          <p style="margin-bottom: 8px;">If you create an account with us, we may collect and maintain information such as your name, email address, account preferences and order history.</p>
          <p style="margin-bottom: 16px;">You are responsible for keeping your account credentials confidential and should notify us if you believe your account has been accessed without your permission.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">5. Marketing Communications</h3>
          <p style="margin-bottom: 16px;">If you choose to subscribe to our marketing communications, we may use your email address or other contact details to send information about products, collections, promotions, offers and other updates from Abel's by Lincy.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">6. Shopping Bag and Website Functionality</h3>
          <p style="margin-bottom: 8px;">We may use cookies, sessions or similar technologies to maintain your active shopping bag and remember information necessary for the Website to function correctly.</p>
          <p style="margin-bottom: 16px;">Where technically necessary, this information may be temporarily stored on your device or associated with your Website session.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">7. Payment Information</h3>
          <p style="margin-bottom: 8px;">Payments made through our Website may be processed by third-party payment providers such as Stripe.</p>
          <p style="margin-bottom: 16px;">Your complete payment card details are processed by the relevant payment provider and are not stored in full on our own servers.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">8. Data Security</h3>
          <p style="margin-bottom: 8px;">We take reasonable steps to protect personal information from misuse, interference, loss and unauthorised access, modification or disclosure.</p>
          <p style="margin-bottom: 16px;">Security measures may include appropriate access controls, authentication procedures, secure connections and reputable third-party service providers.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">9. How Long We Keep Your Information</h3>
          <p style="margin-bottom: 16px;">We retain personal information only for as long as reasonably necessary for the purposes for which it was collected, including order fulfilment, customer service, accounting, legal and regulatory requirements.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">10. Australian Privacy Law</h3>
          <p style="margin-bottom: 8px;">We aim to handle personal information in accordance with applicable Australian privacy requirements, including the <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles (APPs) where they apply to our business.</p>
          <p style="margin-bottom: 16px;">Nothing in this Privacy Policy is intended to exclude or limit any rights you may have under applicable Australian law.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">11. Contact Us</h3>
          <p style="margin-bottom: 8px;">If you have questions about this Privacy Policy, wish to access or correct your personal information, or have a privacy concern, please contact us:</p>
          <p style="margin-bottom: 4px;">Abel's by Lincy</p>
          <p style="margin-bottom: 4px;">Email: <a href="mailto:lincytitus8@gmail.com" style="color: var(--gold); font-weight: 600;">lincytitus8@gmail.com</a></p>
          <p style="margin-bottom: 4px;">Phone: +61 435 927 824</p>
          <p style="margin-bottom: 16px;">Website: <a href="https://abelsbylincy.com" target="_blank" style="color: var(--gold); text-decoration: underline;">abelsbylincy.com</a></p>
        </div>
      `
    },

    terms: {
      title: 'Terms & Conditions',
      html: `
        <div style="font-family: var(--font-sans); color: var(--slate); font-size: 14px; line-height: 1.7;">
          <p style="margin-bottom: 24px; font-style: italic; font-size: 13px;">Last updated: ${currentDateStr}</p>
          <p style="margin-bottom: 20px;">Welcome to Abel's By Lincy. These Terms &amp; Conditions apply to your use of abelsbylincy.com and any purchase made through the Website.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">1. About Us</h3>
          <p style="margin-bottom: 16px;">Operated by Abels by Lincy · Email: lincytitus8@gmail.com · Phone: +61 435 927 824</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">2. Products &amp; Product Information</h3>
          <p style="margin-bottom: 16px;">We make every effort to ensure that product descriptions, photographs, colours, dimensions and other information displayed on the Website are accurate.</p>
          <p style="margin-bottom: 16px;">However, colours may appear slightly different depending on your device, screen settings and lighting conditions.</p>
          <p style="margin-bottom: 16px;">Jewellery is a fashion product and may naturally show minor variations in colour, finish or appearance. Such variations do not necessarily constitute a manufacturing fault.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">3. Pricing</h3>
          <p style="margin-bottom: 8px;">All prices displayed on our Website are in Australian Dollars (AUD).</p>
          <p style="margin-bottom: 8px;">The price displayed for a product is the amount payable at checkout, unless otherwise stated.</p>
          <p style="margin-bottom: 16px;">We reserve the right to correct pricing errors or update product prices at any time. Any price changes will not affect orders that have already been confirmed and paid for.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">4. Orders</h3>
          <p style="margin-bottom: 8px;">When you place an order through our Website, you are making an offer to purchase the selected products.</p>
          <p style="margin-bottom: 8px;">An order is considered accepted once payment has been successfully received and we have confirmed the order.</p>
          <p style="margin-bottom: 8px;">We reserve the right to cancel or refuse an order in circumstances including product availability issues, pricing errors, suspected fraudulent activity or technical errors.</p>
          <p style="margin-bottom: 16px;">If we cancel an order after payment has been received, the amount paid for the cancelled order will be refunded.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">5. Payment</h3>
          <p style="margin-bottom: 8px;">Payments are processed through our available payment gateway (Stripe).</p>
          <p style="margin-bottom: 8px;">We do not store your complete payment card details on our servers. Payment information is processed securely by our payment service provider.</p>
          <p style="margin-bottom: 16px;">You are responsible for providing accurate billing and contact information when placing an order.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">6. Shipping</h3>
          <p style="margin-bottom: 8px;">Shipping and delivery are subject to our Shipping &amp; Delivery Policy.</p>
          <p style="margin-bottom: 16px;">Please ensure that the delivery address and contact details provided during checkout are correct. We are not responsible for delays or failed deliveries caused by incorrect or incomplete information provided by the customer.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">7. Change-of-Mind Returns</h3>
          <p style="margin-bottom: 8px;">We offer a voluntary 7-day change-of-mind return policy for eligible products.</p>
          <p style="margin-bottom: 8px;"><strong>To qualify:</strong></p>
          <ul style="margin-bottom: 16px; padding-left: 24px;">
            <li style="margin-bottom: 6px;">You must contact us within 7 days of receiving your order.</li>
            <li style="margin-bottom: 6px;">The item must be unused and unworn.</li>
            <li style="margin-bottom: 6px;">The item must be returned in its original condition.</li>
            <li style="margin-bottom: 6px;">The original packaging and any accompanying materials must be included.</li>
            <li style="margin-bottom: 6px;">The item must not show signs of damage, wear, perfume, makeup or other use.</li>
          </ul>
          <p style="margin-bottom: 16px;">Customers are responsible for return shipping costs for change-of-mind returns unless otherwise agreed by us.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">8. Australian Consumer Law</h3>
          <p style="margin-bottom: 16px;">Nothing in these Terms &amp; Conditions excludes, restricts or modifies any rights or remedies that cannot legally be excluded under the Australian Consumer Law (ACL).</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">9. Jewellery Care</h3>
          <p style="margin-bottom: 8px;">To maintain the appearance and finish of your jewellery, we recommend avoiding prolonged exposure to water, perfumes, lotions, sweat, chemicals and other substances that may affect plated jewellery.</p>
          <p style="margin-bottom: 16px;">Please refer to any care instructions provided with your order.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">10. Website Use</h3>
          <p style="margin-bottom: 8px;">You agree to use our Website only for lawful purposes.</p>
          <p style="margin-bottom: 8px;"><strong>You must not:</strong></p>
          <ul style="margin-bottom: 16px; padding-left: 24px;">
            <li style="margin-bottom: 6px;">Use the Website for fraudulent or unlawful activities.</li>
            <li style="margin-bottom: 6px;">Attempt to gain unauthorised access to our Website or systems.</li>
            <li style="margin-bottom: 6px;">Copy, reproduce or misuse our Website content without permission.</li>
            <li style="margin-bottom: 6px;">Interfere with the operation or security of the Website.</li>
            <li style="margin-bottom: 6px;">Submit false or misleading information.</li>
          </ul>
        </div>
      `
    },

    shipping: {
      title: 'Shipping & Delivery Policy',
      html: `
        <div style="font-family: var(--font-sans); color: var(--slate); font-size: 14px; line-height: 1.7;">
          <p style="margin-bottom: 24px; font-style: italic; font-size: 13px;">Last updated: ${currentDateStr}</p>
          <p style="margin-bottom: 20px;">At Abel's by Lincy, we aim to process and deliver your order as quickly and carefully as possible. All deliveries are carried out via Australia Post.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">1. Shipping Within Australia & Delivery Partner</h3>
          <p style="margin-bottom: 8px;">We ship across Australia using <strong>Australia Post</strong> for fast and secure delivery.</p>
          <p style="margin-bottom: 16px;">Customers can select between Standard Delivery and Express Post at checkout based on urgency.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">2. Shipping Rates & Tiers</h3>
          <ul style="margin-bottom: 16px; padding-left: 24px;">
            <li style="margin-bottom: 6px;"><strong>Standard Shipping:</strong> $10.00 AUD (Complimentary <strong>FREE Standard Shipping</strong> on orders over $60.00 AUD).</li>
            <li style="margin-bottom: 6px;"><strong>Express Shipping:</strong> $15.00 AUD for urgent orders requiring priority delivery.</li>
          </ul>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">3. Order Processing & Dispatch Timeframes</h3>
          <p style="margin-bottom: 8px;">Orders are packed and dispatched within <strong>1–3 business days</strong> after payment is received (usually next-business-day dispatch on weekdays).</p>
          <p style="margin-bottom: 16px;">Orders placed on weekends or public holidays will be dispatched on the next available business day.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">4. Delivery Timeframes & Tracking</h3>
          <p style="margin-bottom: 8px;">Estimated delivery timeframes after Australia Post dispatch:</p>
          <ul style="margin-bottom: 16px; padding-left: 24px;">
            <li style="margin-bottom: 6px;"><strong>Standard Shipping:</strong> 2–5 business days after dispatch, depending on destination.</li>
            <li style="margin-bottom: 6px;"><strong>Express Shipping:</strong> 1–2 business days after dispatch.</li>
          </ul>
          <p style="margin-bottom: 16px;">Customers will receive an official Australia Post tracking number via email once their order has been packed and dispatched.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">5. Delivery Address Responsibilities</h3>
          <p style="margin-bottom: 8px;">Customers are responsible for providing a complete and accurate delivery address at checkout.</p>
          <p style="margin-bottom: 16px;">We are not responsible for delays or additional costs resulting from incorrect or incomplete delivery information provided by the customer.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">6. Lost or Damaged Parcels</h3>
          <p style="margin-bottom: 16px;">If your parcel appears to have been lost or arrives damaged, please contact us as soon as possible at <a href="mailto:lincytitus8@gmail.com" style="color: var(--gold); font-weight: 600;">lincytitus8@gmail.com</a> with your order number and photographs where applicable.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">7. Contact</h3>
          <p style="margin-bottom: 4px;">For shipping enquiries, please contact:</p>
          <p style="margin-bottom: 4px;">Email: <a href="mailto:lincytitus8@gmail.com" style="color: var(--gold); font-weight: 600;">lincytitus8@gmail.com</a></p>
          <p style="margin-bottom: 16px;">Phone: +61 435 927 824</p>
        </div>
      `
    },
    refunds: {
      title: 'Returns & Refund Policy',
      html: `
        <div style="font-family: var(--font-sans); color: var(--slate); font-size: 14px; line-height: 1.7;">
          <p style="margin-bottom: 24px; font-style: italic; font-size: 13px;">Last updated: ${currentDateStr}</p>
          <p style="margin-bottom: 20px;">At Abel's by Lincy, we want you to be happy with your purchase. This policy explains our voluntary change-of-mind returns as well as your rights under Australian Consumer Law.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">1. 7-Day Change-of-Mind Returns</h3>
          <p style="margin-bottom: 8px;">We offer a voluntary 7-day change-of-mind return period.</p>
          <p style="margin-bottom: 8px;">You must contact us within 7 days of receiving your order if you wish to request a change-of-mind return.</p>
          <p style="margin-bottom: 8px;">To be eligible, the jewellery must:</p>
          <ul style="margin-bottom: 16px; padding-left: 24px;">
            <li style="margin-bottom: 6px;">Be unused and unworn.</li>
            <li style="margin-bottom: 6px;">Be in its original condition.</li>
            <li style="margin-bottom: 6px;">Be returned in the original packaging.</li>
            <li style="margin-bottom: 6px;">Include all original packaging and accompanying items.</li>
            <li style="margin-bottom: 6px;">Not show signs of damage, scratches, makeup, perfume, water exposure or other use.</li>
          </ul>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">2. Change-of-Mind Return Exclusions</h3>
          <p style="margin-bottom: 8px;">For hygiene, product condition and business reasons, we may not accept change-of-mind returns where the item has been worn, damaged, altered or returned without its original packaging.</p>
          <p style="margin-bottom: 16px;">Change-of-mind returns are separate from claims relating to faulty or defective products.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">3. Return Shipping Costs</h3>
          <p style="margin-bottom: 8px;">For approved change-of-mind returns, the customer is generally responsible for the cost of returning the item to us.</p>
          <p style="margin-bottom: 16px;">We recommend using a tracked postal service and retaining proof of postage until the return has been processed.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">4. Faulty or Damaged Items</h3>
          <p style="margin-bottom: 8px;">If your jewellery arrives damaged or you believe the product has a manufacturing fault, please contact us at <a href="mailto:lincytitus8@gmail.com" style="color: var(--gold); font-weight: 600;">lincytitus8@gmail.com</a> as soon as reasonably possible.</p>
          <p style="margin-bottom: 8px;">Please provide:</p>
          <ul style="margin-bottom: 16px; padding-left: 24px;">
            <li style="margin-bottom: 6px;">Your order number.</li>
            <li style="margin-bottom: 6px;">A description of the issue.</li>
            <li style="margin-bottom: 6px;">Clear photographs or videos showing the problem.</li>
          </ul>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">5. Refund Processing</h3>
          <p style="margin-bottom: 8px;">Once an approved return has been received and assessed, we will notify you of the outcome.</p>
          <p style="margin-bottom: 8px;">Where a refund is approved, it will generally be processed using the original payment method.</p>
          <p style="margin-bottom: 16px;">The time for the refunded amount to appear in your account may depend on your bank or payment provider.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">6. Exchanges</h3>
          <p style="margin-bottom: 8px;">Where appropriate and subject to product availability, we may offer an exchange for an eligible returned item.</p>
          <p style="margin-bottom: 16px;">If the requested replacement is unavailable, another appropriate remedy may be offered.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">7. Items Returned Without Approval</h3>
          <p style="margin-bottom: 8px;">Please contact us before sending a return.</p>
          <p style="margin-bottom: 16px;">Unapproved or incorrectly addressed returns may cause delays in processing.</p>

          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">8. How to Request a Return &amp; Contact</h3>
          <p style="margin-bottom: 8px;">To request a return or report a faulty item, or for all returns and refund enquiries, please contact us:</p>
          <p style="margin-bottom: 4px;">Email: <a href="mailto:lincytitus8@gmail.com" style="color: var(--gold); font-weight: 600;">lincytitus8@gmail.com</a></p>
          <p style="margin-bottom: 16px;">Phone: +61 435 927 824</p>
          <p style="margin-bottom: 8px;">Please include your order number, your name and a brief description of the reason for your return. We will provide further instructions where your return request is eligible.</p>
        </div>
      `
    }

  };

  const currentPolicy = contentMap[activeTab] || contentMap.privacy;

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle" id="policy-date">Updated: {months[d.getMonth()]} {d.getFullYear()}</p>
          <h1 id="policy-title">{currentPolicy.title}</h1>
        </div>
      </div>

      <div style={{ background: '#ffffff', minHeight: 400 }}>
        <div className="container" style={{ maxWidth: 900, paddingBottom: 80, paddingTop: 48, margin: '0 auto' }}>
          {/* Policy Tab Buttons */}
          <style>{`
            .policy-tab-bar {
              display: flex;
              gap: 10px;
              flex-wrap: nowrap;
              justify-content: center;
              align-items: center;
              overflow-x: auto;
              padding: 8px 6px;
              margin: 16px auto;
              width: 100%;
            }
            .policy-tab-bar .btn-secondary {
              font-size: 13px;
              padding: 12px 22px;
              white-space: nowrap;
              flex-shrink: 0;
              letter-spacing: 0.06em;
              transform: none !important;
            }
            .policy-tab-bar .btn-secondary:hover,
            .policy-tab-bar .btn-secondary.active {
              transform: none !important;
            }
            @media (max-width: 600px) {
              .policy-tab-bar {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                overflow-x: unset;
                padding: 4px;
                margin-top: 8px;
                margin-bottom: 8px;
              }
              .policy-tab-bar .btn-secondary {
                font-size: 11px;
                padding: 10px 8px;
                text-align: center;
                white-space: normal;
              }
            }
          `}</style>
          <div className="policy-tab-bar">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`btn-secondary${activeTab === t.id ? ' active' : ''}`}
                onClick={() => setSearchParams({ tab: t.id })}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Policy Content */}
          <div style={{ paddingTop: 12 }}>
            <div className="checkout-card" style={{ padding: 32 }}>
              <div dangerouslySetInnerHTML={{ __html: currentPolicy.html }} />
              <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--slate)' }}>
                For any legal or policy inquiries, please email <a href="mailto:lincytitus8@gmail.com" style={{ color: 'var(--gold)', fontWeight: 600 }}>lincytitus8@gmail.com</a>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
