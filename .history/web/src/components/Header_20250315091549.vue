<!--
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-12 09:20:58
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-13 12:33:48
 * @FilePath: \passengerInfoSearch\web\src\components\Header.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <el-form ref="ruleFormRef" :rules="rules" :inline="true" :model="ruleForm" class="demo-form-inline">
    <el-form-item>
      <el-checkbox-group v-model="checkedItems" :min="1" @change="resetForm(ruleFormRef)">
        <el-checkbox v-for="item in items" :key="item" :label="item" :value="item">
          {{ item }}
        </el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item label="姓名" prop="name" v-if="checkedItems.includes('姓名')">
      <el-input v-model="ruleForm.name" :formatter="(value) => value.toUpperCase()" placeholder="输入姓名" clearable />
    </el-form-item>
    <el-form-item label="航班号" prop="flight" v-if="checkedItems.includes('航班号')">
      <el-input v-model="ruleForm.flight" :formatter="(value) => value.toUpperCase()" placeholder="输入航班号" clearable />
    </el-form-item>
    <el-form-item label="身份证号" prop="IDcard" v-if="checkedItems.includes('身份证号')">
      <el-input v-model="ruleForm.IDcard" :formatter="(value) => value.toUpperCase()" placeholder="输入身份证号" clearable />
    </el-form-item>
    <el-form-item label="时间范围">
      <el-select v-model="ruleForm.time" placeholder="选择时间">
        <el-option label="一周内" :value="7" />
        <el-option label="一月内" :value="30" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit(ruleFormRef)" :disabled="btnDisabled">Query {{ btnDisabled ? time : null
        }}</el-button>
      <el-button @click="handleChange">Reset</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive, defineEmits } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const emit = defineEmits([
  'emitSearch', 'emitReset'
])
const checkedItems = ref(['姓名'])
const items = ['姓名', '航班号', '身份证号']

const ruleForm = reactive({
  name: '',
  flight: '',
  IDcard: '',
  time: 7
})
const validators = [
  (rule: any, value: any, callback: any) => {
    if (value === '') {
      callback(new Error('请输入姓名'))
    } else if (!/^[\u4e00-\u9fa5]{2,4}$/.test(value)) {
      callback(new Error("输入的姓名不符合规范"))
    } else {
      callback()
    }
  },
  (rule: any, value: any, callback: any) => {
    if (value === '') {
      callback(new Error('请输入航班号'))
    } else if (!/^[A-Z\d]{2}\d{3,4}$/.test(value)) {
      callback(new Error("输入的航班号不符合规范"))
    } else {
      callback()
    }
  },
  (rule: any, value: any, callback: any) => {
    if (value === '') {
      callback(new Error('请输入航班号'))
    } else if (!/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(value)) {
      callback(new Error("输入的身份证号不符合规范"))
    } else {
      callback()
    }
  }
];
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<typeof ruleForm>>({
  name: [{ required: checkedItems.value.includes('姓名'), validator: validators[0], trigger: 'blur' }],
  flight: [{ required: checkedItems.value.includes('航班号'), validator: validators[1], trigger: 'blur' }],
  IDcard: [{ required: checkedItems.value.includes('身份证号'), validator: validators[2], trigger: 'blur' }],
});

let timer = null;
const time = ref(5);
const btnDisabled = ref(true);

const handleChange = () => {
  Object.keys(ruleForm).forEach(key => {
    if (ruleForm[key] && key != 'time') {
      // console.log(key, params[key]);
      ruleForm[key] = '';
    }
  });
}

const onSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      console.log('submit');
      emit('emitSearch', ruleForm);
      timer = setInterval(() => {
        time.value--;
        if (time.value <= 0) {
          clearInterval(timer);
          time.value = 5;
        }
      });
    } else {
      console.log('error submit');
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields();
  emit('emitReset', '');
}
</script>

<style>
.demo-form-inline .el-input {
  --el-input-width: 120px;
}

.demo-form-inline .el-select {
  --el-select-width: 120px;
}
</style>
