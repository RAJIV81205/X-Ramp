const copy = {
  en: {
    common: {
      appName: 'X-Ramp',
      login: 'Log in',
      getStarted: 'Get started',
      createWallet: 'Create Wallet',
      backToHome: 'Back to home',
      dashboard: 'Dashboard',
      cancel: 'Cancel',
      done: 'Done',
      loadingWallet: 'Loading your wallet...',
      redirecting: 'Redirecting...',
    },
    landing: {
      headline: "The world's best",
      subheadline: 'ZK Fiat Ramp',
      body: 'Proof based liquidity. Onboard users directly to Stellar without seed phrases. Cryptographically verifiable, completely trustless.',
      metricsTitle: 'Live product traction',
    },
    auth: {
      welcomeBack: 'Welcome Back',
      signInDescription: 'Sign in to your X-Ramp account',
      createAccount: 'Create Account',
      registerDescription: 'Join X-Ramp for keyless crypto transactions',
    },
    dashboard: {
      welcome: 'Welcome back!',
      subtitle: 'Manage your keyless crypto wallet with zero-knowledge privacy.',
      quickActions: 'Quick Actions',
      walletInfo: 'Wallet Info',
      insights: 'Portfolio Insights',
      notifications: 'Alerts & Notifications',
      help: 'Help & FAQ',
      recentTransactions: 'Recent Transactions',
    },
  },
  hi: {
    common: {
      appName: 'X-Ramp',
      login: 'लॉग इन',
      getStarted: 'शुरू करें',
      createWallet: 'वॉलेट बनाएं',
      backToHome: 'होम पर वापस जाएं',
      dashboard: 'डैशबोर्ड',
      cancel: 'रद्द करें',
      done: 'पूर्ण',
      loadingWallet: 'आपका वॉलेट लोड हो रहा है...',
      redirecting: 'रीडायरेक्ट किया जा रहा है...',
    },
    landing: {
      headline: 'दुनिया का सबसे भरोसेमंद',
      subheadline: 'ZK Fiat Ramp',
      body: 'प्रूफ-आधारित लिक्विडिटी के साथ Stellar पर बिना seed phrase के users onboard करें। पूरी तरह cryptographically verifiable और trustless.',
      metricsTitle: 'लाइव प्रोडक्ट ट्रैक्शन',
    },
    auth: {
      welcomeBack: 'फिर से स्वागत है',
      signInDescription: 'अपने X-Ramp अकाउंट में साइन इन करें',
      createAccount: 'अकाउंट बनाएं',
      registerDescription: 'Keyless crypto transactions के लिए X-Ramp जॉइन करें',
    },
    dashboard: {
      welcome: 'फिर से स्वागत है!',
      subtitle: 'Zero-knowledge privacy के साथ अपना keyless crypto wallet मैनेज करें।',
      quickActions: 'त्वरित क्रियाएं',
      walletInfo: 'वॉलेट जानकारी',
      insights: 'पोर्टफोलियो इनसाइट्स',
      notifications: 'अलर्ट और नोटिफिकेशन',
      help: 'मदद और FAQ',
      recentTransactions: 'हाल के ट्रांजैक्शन',
    },
  },
};

export function t(language, key, fallback = key) {
  const value = key.split('.').reduce((acc, part) => acc?.[part], copy[language] || copy.en);
  return value ?? fallback;
}

export function friendlyErrorMessage(message) {
  if (!message) return 'Something went wrong. Please try again.';

  const normalized = message.toLowerCase();

  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'We could not reach the network. Please check your connection and try again.';
  }

  if (normalized.includes('invalid token') || normalized.includes('authentication failed')) {
    return 'Your session expired. Please log in again and retry.';
  }

  if (normalized.includes('insufficient balance')) {
    return 'You do not have enough XLM for this action. Try a smaller amount or fund the wallet first.';
  }

  if (normalized.includes('account not found')) {
    return 'This Stellar wallet is not funded on testnet yet. Fund it once, then try again.';
  }

  if (normalized.includes('minimum transfer')) {
    return 'The amount is below the minimum allowed transfer size.';
  }

  if (normalized.includes('recipient')) {
    return 'We could not verify the recipient details. Please double-check the email and try again.';
  }

  if (normalized.includes('wallet')) {
    return 'We had trouble loading your wallet details. Refresh and try once more.';
  }

  return message;
}

export function shortAddress(value = '', start = 6, end = 6) {
  if (!value || value.length <= start + end) return value;
  return `${value.slice(0, start)}...${value.slice(-end)}`;
}
