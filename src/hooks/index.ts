// 全局可复用组件
import { followOrUnfollow } from "@/services/consult";
import { ref } from "vue";
import type { FollowType } from "@/types/consult";
import { showImagePreview } from "vant";
import { getPrescriptionPic } from "@/services/consult";

import { useClipboard } from "@vueuse/core";
import { showFailToast, showSuccessToast } from "vant";

export const useFollow = (type: FollowType = "doc") => {
  const loading = ref(false);
  const follow = async (item: { id: string; likeFlag: number }) => {
    loading.value = true;
    try {
      await followOrUnfollow(item.id, type);
      item.likeFlag = item.likeFlag === 1 ? 0 : 1;
    } finally {
      loading.value = false;
    }
  };
  return { loading, follow };
};
export const usePreImg = () => {
  //查看处方
  const showPrescription = async (id?: string) => {
    if (id) {
      const res = await getPrescriptionPic(id);
      showImagePreview([res.data.url]);
    }
  };
  return { showPrescription };
};

export const useCopy = () => {
  const { text, copy, copied, isSupported } = useClipboard();
  const copyFn = (copyText: string) => {
    if (!isSupported.value) return showFailToast("复制失败");
    copy(copyText);
  };

  return {
    copyFn,
    copied,
  };
};
