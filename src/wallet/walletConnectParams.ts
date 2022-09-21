import QRCodeModal from '@walletconnect/qrcode-modal';

const walletConnectParams = {
  bridge: 'https://bridge.walletconnect.org', // Required
  qrcodeModal: QRCodeModal,
  clientMeta: {
    description: 'ninDAO telegram bot',
    url: 'https://nindao.xyz',
    icons: ['https://walletconnect.org/walletconnect-logo.png'], // default icon TODO: replace with our
    name: 'ninDAO',
  },
};

export default walletConnectParams;
