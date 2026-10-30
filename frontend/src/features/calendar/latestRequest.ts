type RequestCallbacks<T> = {
  success: (data: T) => void;
  failure: (error: unknown) => void;
  complete: () => void;
};

export function createLatestRequest() {
  let latestRequestId = 0;

  return {
    invalidate() {
      // 번호를 바꾸면 진행 중인 요청의 결과는 무시
      latestRequestId += 1;
    },

    async run<T>(load: () => Promise<T>, callbacks: RequestCallbacks<T>) {
      latestRequestId += 1;
      const requestId = latestRequestId;

      try {
        const data = await load();

        // 더 나중에 시작한 요청이 없다면 화면에 반영
        if (requestId === latestRequestId) {
          callbacks.success(data);
        }
      } catch (error) {
        if (requestId === latestRequestId) {
          callbacks.failure(error);
        }
      } finally {
        if (requestId === latestRequestId) {
          callbacks.complete();
        }
      }
    },
  };
}
