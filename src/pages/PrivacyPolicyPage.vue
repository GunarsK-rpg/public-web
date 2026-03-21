<template>
  <q-page class="flex flex-center">
    <q-card class="privacy-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Privacy Policy</div>
        <div class="text-subtitle2">Cosmere RPG Character Sheet Manager</div>
      </q-card-section>

      <q-card-section class="privacy-content">
        <p class="text-caption text-grey-7">Last updated: March 20, 2026</p>

        <h3>What We Collect</h3>
        <p>When you create an account, we collect:</p>
        <ul>
          <li><strong>Username</strong> and <strong>email address</strong></li>
          <li><strong>Password</strong> (stored as a one-way hash, never in plain text)</li>
          <li><strong>Display name</strong> (optional, set by you)</li>
        </ul>
        <p>
          If you sign in with Google, we receive your email address and a unique account identifier
          from Google. We do not receive or store your Google password.
        </p>

        <h3>What We Log</h3>
        <p>
          When you use the application, we log your <strong>IP address</strong> and
          <strong>browser user agent</strong> alongside data changes for security auditing. These
          audit logs help us investigate unauthorized access and are retained for 12 months, after
          which they are automatically deleted.
        </p>

        <h3>How We Use Your Data</h3>
        <ul>
          <li>Authenticate your sessions and manage your account</li>
          <li>Send transactional emails (email verification, password reset)</li>
          <li>Maintain audit logs for security purposes</li>
        </ul>
        <p>We do not use your data for marketing, advertising, or profiling.</p>

        <h3>Third-Party Services</h3>
        <ul>
          <li>
            <strong>Google OAuth</strong> (optional) &mdash; if you choose to sign in with Google,
            your email is shared with Google during the authentication flow.
          </li>
          <li>
            <strong>Amazon Web Services (AWS)</strong> &mdash; our infrastructure runs on AWS in the
            EU (Ireland). AWS processes data on our behalf under their
            <a
              href="https://aws.amazon.com/compliance/data-privacy-faq/"
              target="_blank"
              rel="noopener"
              >Data Processing Addendum</a
            >.
          </li>
        </ul>
        <p>We do not sell, share, or provide your data to any other third parties.</p>

        <h3>Cookies</h3>
        <p>
          We use a single authentication cookie to maintain your login session. This cookie is
          strictly necessary for the application to function and does not track you across other
          websites. We do not use analytics, advertising, or tracking cookies.
        </p>

        <h3>Data Storage and Security</h3>
        <p>
          Your data is stored in encrypted databases hosted on AWS in the EU (Ireland). Some
          supporting services (CDN edge nodes, web application firewall, TLS certificates) operate
          from additional AWS regions including the US, but your stored data remains in the EU. All
          data is encrypted in transit (TLS 1.3) and at rest (AES-256). Access to production systems
          is restricted to the application operator.
        </p>

        <h3>Your Rights</h3>
        <p>Under the EU General Data Protection Regulation (GDPR), you have the right to:</p>
        <ul>
          <li><strong>Access</strong> your personal data</li>
          <li><strong>Correct</strong> inaccurate data (via Account Settings)</li>
          <li><strong>Delete</strong> your account and associated data</li>
          <li><strong>Export</strong> your data in a portable format</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at the email address below. We will respond
          within 30 days.
        </p>

        <h3>Data Retention</h3>
        <ul>
          <li>Account data is retained for as long as your account exists</li>
          <li>Audit logs are retained for 12 months</li>
          <li>
            When you delete your account, your personal data and all associated character, campaign,
            and combat data are permanently removed
          </li>
        </ul>

        <h3>Contact</h3>
        <p>
          For privacy-related questions or data requests, contact:
          <a href="mailto:privacy@gunarsk.com">privacy@gunarsk.com</a>
        </p>
      </q-card-section>

      <q-card-section class="text-center">
        <q-btn flat no-caps color="primary" :to="{ name: 'login' }">Back</q-btn>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts"></script>

<style scoped>
.privacy-card {
  width: 100%;
  max-width: 700px;
  margin: 16px;
}

.privacy-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 1.5rem 0 0.5rem;
}

.privacy-content h3:first-of-type {
  margin-top: 0.5rem;
}

.privacy-content p,
.privacy-content ul {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.privacy-content ul {
  padding-left: 1.5rem;
}

.privacy-content li {
  margin: 0.25rem 0;
}
</style>
