import { ref } from 'vue';

export function useGetUserReviews() {
  const loading = ref(false);
  const error = ref< null | string >(null);
  const userReviews = ref([]);

  const getUserReviews = async (username: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`/api/user/${encodeURIComponent(username)}/reviews`);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      userReviews.value = await response.json();
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  return { getUserReviews, loading, error, userReviews };
}

export function useGetUser() {
  const loading = ref(false);
  const error = ref< null | string >(null);
  const userData = ref('');

  // This could be a nicer vue component instead of just prompt.
  const promptForUserName = (): Promise<string> => {
    return new Promise((resolve) => {
      const userName = prompt('Please enter your name:') || '';
      resolve(userName);
    });
  };

  const getUser = async (inputUser = '') => {
    loading.value = true;
    error.value = null;
    try {
      inputUser = localStorage.getItem('user') || '';
      let userName = inputUser;

      if (!userName) {
        userName = await promptForUserName();
      }

      if (userName === '') {
        localStorage.setItem('user', '');
        userData.value = '';
      } else {
        localStorage.setItem('user', userName);
        userData.value = userName;
      }
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  return { getUser, loading, error, userData };
}