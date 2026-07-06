import { ref } from 'vue';

const visible = ref(false);
const message = ref('');
const type = ref('success'); // 'success' | 'error' | 'info'

export function showToast(msg, t = 'success') {
    message.value = msg;
    type.value = t;
    visible.value = true;
    setTimeout(() => {
        visible.value = false;
    }, 3500);
}

export const toastState = {
    visible,
    message,
    type
};
