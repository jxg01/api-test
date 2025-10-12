<template>
  <div class="file-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文件管理</span>
          <el-button type="primary" @click="showUploadDialog">上传文件</el-button>
        </div>
      </template>

      <!-- 文件列表 -->
      <div class="file-list">
        <el-table :data="fileList" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="文件名" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="file_name" label="文件路径" />
          <el-table-column prop="uploaded_by" label="上传人" />
          <el-table-column prop="uploaded_at" label="上传时间" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="text" @click="previewFile(row)">预览</el-button>
              <el-button type="text" danger @click="deleteFile(row.id, row.name)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 上传文件对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传文件"
      width="500px"
      @close="resetUploadForm"
    >
      <el-form ref="uploadFormRef" :model="uploadForm" :rules="uploadRules" label-width="80px">
        <el-form-item label="文件名" prop="name">
          <el-input v-model="uploadForm.name" placeholder="请输入文件名" @keyup.enter.prevent="handleNameInputEnter" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="uploadForm.description" type="textarea" placeholder="请输入文件描述" />
        </el-form-item>
        <el-form-item label="文件" prop="file">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileListUpload"
            :multiple="false"
            :accept="'.png,.jpg,.txt,.pdf,.csv,.xlsx,.xls'"
            class="upload-demo"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip text-small">
                支持上传：png, jpg, txt, pdf, csv, xlsx 格式的文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpload">确认上传</el-button>
        </span>
      </template>
    </el-dialog>


  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { testFileApi } from '../api/testFile.api';
import type { UploadFile } from 'element-plus';

// 文件列表相关数据
const fileList = ref<Array<any>>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 上传对话框相关数据
const uploadDialogVisible = ref(false);
const uploadForm = reactive({
  name: '',
  description: '',
  file: null as File | null
});
const fileListUpload = ref<UploadFile[]>([]);
const uploadRules = {
  name: [{ required: true, message: '请输入文件名', trigger: 'blur' }],
  description: [{ required: true, message: '请输入文件描述', trigger: 'blur' }],
  file: [{ required: true, message: '请选择文件', trigger: 'change' }]
};
const uploadFormRef = ref();
const uploadRef = ref();

// 文件预览相关数据
const currentPreviewFile = ref<any>(null);

// 获取文件列表
const fetchFileList = async () => {
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    };
    const response = await testFileApi.getFileList(params);
    fileList.value = response.data || [];
    console.log('文件列表:', fileList.value);
    total.value = response.data.count || 0;
  } catch (error) {
    ElMessage.error('获取文件列表失败');
    console.error('获取文件列表失败:', error);
  }
};

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchFileList();
};

const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  fetchFileList();
};

// 显示上传对话框
const showUploadDialog = () => {
  resetUploadForm();
  uploadDialogVisible.value = true;
};

// 重置上传表单
const resetUploadForm = () => {
  uploadForm.name = '';
  uploadForm.description = '';
  uploadForm.file = null;
  fileListUpload.value = [];
  if (uploadFormRef.value) {
    uploadFormRef.value.resetFields();
  }
};

// 文件变化处理
const handleFileChange = (uploadFile: UploadFile, uploadFiles: UploadFile[]) => {
  // 只保留最后选择的文件
  fileListUpload.value = [uploadFile];
  uploadForm.file = uploadFile.raw as File;
};

// 处理文件名输入框回车事件
const handleNameInputEnter = () => {
  // 阻止默认行为，防止页面刷新
  // 可以将焦点移动到下一个输入框
  const descriptionInput = document.querySelector('textarea[placeholder="请输入文件描述"]');
  if (descriptionInput) {
    (descriptionInput as HTMLTextAreaElement).focus();
  }
};

// 提交上传
const submitUpload = async () => {
  if (!uploadFormRef.value) return;
  
  uploadFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const formData = new FormData();
        formData.append('name', uploadForm.name);
        formData.append('description', uploadForm.description);
        if (uploadForm.file) {
          // 确保文件正确添加到FormData中
          formData.append('file', uploadForm.file);
          console.log('文件大小:', uploadForm.file.size);
          console.log('文件类型:', uploadForm.file.type);
        }

        // 传递FormData给API，并且需要确保API调用时不设置Content-Type
        await testFileApi.createFile(formData);
        ElMessage.success('文件上传成功');
        uploadDialogVisible.value = false;
        fetchFileList();
      } catch (error) {
        ElMessage.error('文件上传失败');
        console.error('文件上传失败:', error);
      }
    }
  });
};

// 预览文件 - 在新标签页打开
const previewFile = (file: any) => {
  currentPreviewFile.value = file;
  
  // 获取文件路径并拼接环境变量中的基础URL
  const fileUrl = `${import.meta.env.VITE_FILE_BASE_URL}${file.file_name}`;
  
  // 在新标签页打开文件
  window.open(fileUrl, '_blank');
};

// 获取文件扩展名
const getFileExtension = (filename: string) => {
  return filename.split('.').pop() || '';
};



// 下载文件
const downloadFile = () => {
  if (currentPreviewFile.value) {
    const fileUrl = `${import.meta.env.VITE_FILE_BASE_URL}${currentPreviewFile.value.file_name}`;
    window.open(fileUrl, '_blank');
  }
};

// 删除文件
const deleteFile = async (id: number, name: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await testFileApi.deleteFile(id);
    ElMessage.success('文件删除成功');
    fetchFileList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('文件删除失败');
      console.error('文件删除失败:', error);
    }
  }
};

// 初始加载文件列表
onMounted(() => {
  fetchFileList();
});
</script>

<style scoped>
.file-manage-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-list {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.preview-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 600px;
}

.preview-text-container {
  max-height: 600px;
  overflow: auto;
}

.preview-text-container pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
}

.preview-unsupported {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.text-small {
  font-size: 12px;
}
</style>