<script setup lang="ts">
import { getPatientList, addPatient, editPatient, delPatient } from '@/services/user'
import type { Patient, PatientList } from '@/types/user'
import { showToast, showSuccessToast, type FormInstance } from 'vant';
import { watch } from 'vue';
import { computed, onMounted, ref } from 'vue'
import { nameRules, idCardRules } from '@/utils/rules';
import Validator from 'id-validator';
import { showConfirmDialog } from 'vant';
import { useConsultStore } from '@/stores';
import { useRoute } from 'vue-router';
import router from '@/router';

const patientList = ref<PatientList>([]);
const getPatient = async () => {
    const { data } = await getPatientList();
    console.log('data', data);
    patientList.value = data
    // 设置默认选中的ID，当你是选择患者的时候，且有患者信息的时候
    if (isChange.value && patientList.value.length) {
        const defPatient = patientList.value.find((item) => item.defaultFlag === 1)
        if (defPatient) patientId.value = defPatient.id
        else patientId.value = patientList.value[0].id
    }
}
const store = useConsultStore()
const route = useRoute();
const isChange = computed(() => route.query.isChange === '1')

const patientId = ref<string>()
const selectedPatient = (item: Patient) => {
    if (isChange.value) {
        patientId.value = item.id
    }
}

onMounted(() => {
    getPatient()
})
const defaultPatient: Patient = {
    name: '',
    idCard: '',
    gender: 1,
    defaultFlag: 0
}
// 2. 打开侧滑栏
const show = ref(false)
const defaultFlag = ref(false)
const showPopup = (item?: Patient) => {
    console.log(111);

    if (item?.idCard) {
        patient.value = item
    } else {
        // 打开时，赋值为空
        patient.value = { ...defaultPatient }
        defaultFlag.value = false
    }

    show.value = true
}
const backFn = () => {
    show.value = false;
}
const options = [
    { label: '男', value: 1 },
    { label: '女', value: 0 }
]
const patient = ref<Patient>({ ...defaultPatient })
console.log('patient', patient)


watch(defaultFlag, () => {
    patient.value.defaultFlag = defaultFlag.value ? 1 : 0;
})
const idCardValidator = new Validator();
const saveFn = async () => {
    if (!patient.value.name) return showToast('请输入姓名！')
    if (!patient.value.idCard) return showToast('请输入身份证号！')
    if (!idCardValidator.isValid(patient.value.idCard)) return showToast('身份证号错误！')
    const { sex } = idCardValidator.getInfo(patient.value.idCard)
    if (sex !== patient.value.gender) return showToast('身份证性别与选择性别不一致！')
    // 校验通过
    if (patient.value.genderValue) delete patient.value.genderValue
    if (patient.value.age) delete patient.value.age
    console.log('校验通过');
    patient.value.id ? await editPatient(patient.value) : await addPatient(patient.value)
    // show.value = false;
    backFn()
    getPatient()
    showSuccessToast(patient.value.id ? '编辑成功' : '添加成功')

}
const remove = async () => {
    if (patient.value.id) {
        await showConfirmDialog({
            title: '温馨提示',
            message: `您确认要删除 ${patient.value.name} 患者信息吗 ？`
        })
        await delPatient(patient.value.id)
        backFn()
        getPatient()
        showSuccessToast('删除成功')
    }
}
// 下一步
const next = async () => {
    if (!patientId.value) return showToast('请选就诊择患者')
    store.setPatient(patientId.value)
    router.push('/consult/pay')
}

</script>

<template>
    <div class="patient-page">
        <cp-nav-bar :title="isChange ? '选择患者' : '家庭档案'" />
        <!-- 头部提示 -->
        <div class="patient-change" v-if="isChange">
            <h3>请选择患者信息</h3>
            <p>以便医生给出更准确的治疗，信息仅医生可见</p>
        </div>
        <div class="patient-list">
            <div class="patient-item" v-for="item in patientList" :key="item.id" @click="selectedPatient(item)"
                :class="{ selected: patientId === item.id }">
                <div class="info">
                    <span class="name">{{ item.name }}</span>
                    <span class="id">{{ item.idCard.replace(/^(.{6}).+(.{4})$/, '\$1********\$2') }}</span>
                    <span>{{ item.gender }}</span>
                    <span>{{ item.age }}岁</span>
                </div>
                <div class="icon"><cp-icon name="user-edit" @click="showPopup(item)" /></div>
                <div class="tag" v-if="item.defaultFlag === 1">默认</div>
            </div>
            <div class="patient-add" v-if="patientList.length < 6" @click="showPopup()">
                <div class="patient-tip">最多可添加 6 人</div>
            </div>
            <!-- 底部按钮 -->
            <div class="patient-next" v-if="isChange" @click="next">
                <van-button type="primary" round block>下一步</van-button>
            </div>
        </div>
        <!-- 侧边栏 -->
        <van-popup v-model:show="show" position="right">
            <cp-nav-bar :title="patient.id ? '编辑患者' : '添加患者'" right-text="保存" @click-right="saveFn"
                :back="backFn"></cp-nav-bar>
            <van-field v-model="patient.name" :rules="nameRules" label="真实姓名" placeholder="请输入真实姓名" />
            <van-field v-model="patient.idCard" :rules="idCardRules" label="身份证号" placeholder="请输入身份证号" />
            <van-field label="性别" class="pb4">
                <!-- 单选按钮组件 -->
                <template #input>
                    <cp-radio-btn v-model="patient.gender" :options="options"></cp-radio-btn>
                </template>
            </van-field>
            <van-field label="默认就诊人">
                <template #input>
                    <van-checkbox v-model="defaultFlag" :icon-size="18" round />
                </template>
            </van-field>
            <van-action-bar v-if="patient.id">
                <van-action-bar-button @click="remove">删除</van-action-bar-button>
            </van-action-bar>
        </van-popup>

    </div>
</template>

<style lang="scss" scoped>
.patient-page {
    padding: 46px 0 80px;
    box-sizing: border-box;

    :deep() {
        .van-popup {
            width: 80%;
            height: 100%;
            padding-top: 46px;
            box-sizing: border-box;
        }
    }
}

.patient-page {
    padding: 46px 0 80px;
}

.patient-list {
    padding: 15px;
}

.patient-item {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: var(--cp-bg);
    border-radius: 8px;
    margin-bottom: 15px;
    position: relative;
    border: 1px solid var(--cp-bg);
    transition: all 0.3s;
    overflow: hidden;

    .info {
        display: flex;
        flex-wrap: wrap;
        flex: 1;

        span {
            color: var(--cp-tip);
            margin-right: 20px;
            line-height: 30px;

            &.name {
                font-size: 16px;
                color: var(--cp-text1);
                width: 80px;
                margin-right: 0;
            }

            &.id {
                color: var(--cp-text2);
                width: 180px;
            }
        }
    }

    .icon {
        color: var(--cp-tag);
        width: 20px;
        text-align: center;
    }

    .tag {
        position: absolute;
        right: 60px;
        top: 21px;
        width: 30px;
        height: 16px;
        font-size: 10px;
        color: #fff;
        background-color: var(--cp-primary);
        border-radius: 2px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    &.selected {
        border-color: var(--cp-primary);
        background-color: var(--cp-plain);

        .icon {
            color: var(--cp-primary);
        }
    }
}

.patient-add {
    background-color: var(--cp-bg);
    color: var(--cp-primary);
    text-align: center;
    padding: 15px 0;
    border-radius: 8px;

    .cp-icon {
        font-size: 24px;
    }
}

.patient-tip {
    color: var(--cp-tag);
    padding: 12px 0;
}

.pb4 {
    padding-bottom: 4px;
}

// 底部操作栏
.van-action-bar {
    padding: 0 10px;
    margin-bottom: 10px;

    .van-button {
        color: var(--cp-price);
        background-color: var(--cp-bg);
    }
}

.patient-change {
    padding: 15px;

    >h3 {
        font-weight: normal;
        margin-bottom: 5px;
    }

    >p {
        color: var(--cp-text3);
    }
}

.patient-next {
    padding: 15px;
    background-color: #fff;
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 80px;
    box-sizing: border-box;
}
</style>
