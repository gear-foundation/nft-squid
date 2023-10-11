export interface UserMessageSentArgs {
  message: {
    id: string;
    source: string;
    destination: string;
    payload: string;
    gasLimit: string;
    value: string;
    details: null | {
      to: string;
      code: {
        value: {
          __kind: 'Manual' | 'Auto';
        };
        __kind: 'Success' | 'Error';
      };
    };
  };
  expiration: number;
}
