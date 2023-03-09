<template>
    <el-dialog v-model="visible" :title="localTitle" :close-on-click-modal="false" :before-close="close">
        <span>wqewqewq</span>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="close">取消</el-button>
                <el-button @click="confirm" type="primary">确定</el-button>
                <el-button @click="getProp">获取prop</el-button>
            </span>
        </template>
    </el-dialog>

</template>


<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue'

export default defineComponent({
    props: {
        dialogVisible: {
            type: Boolean,
            default: false,
        },
        dialogTitle: {
            type: String,
            default: 'add'
        }
    },
    setup(props, ctx){
        // 获取 props 中的数据，然后再 return，然后再使用
        // 值有变动后，通知父组件修改对应的值
        const visible = computed({
            get(){
                return props.dialogVisible
            },
            set(value) {
                console.log('in visible', value)
                ctx.emit('update:dialogVisible', value)
            }
        });

        const localTitle = computed(() => {
            return props.dialogTitle
        });

        const getProp = () => {
            console.log('in dialog >> ', props)
        };

        const close = () => {
            ctx.emit('update:dialogVisible', false);
        };

        const confirm = () => {
            ctx.emit('update:dialogVisible', false);
            console.log('in confirm ')
        };

        return {
            close,
            confirm,
            visible,
            getProp,
            localTitle,


        }



    }


})


</script>
