import * as React from 'react';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import { open } from '@tauri-apps/plugin-dialog';
import {
  Alert,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  LinearProgress,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { invoke } from "@tauri-apps/api/core";
import Paper from "@mui/material/Paper";
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import ClearIcon from '@mui/icons-material/Clear';
import ReplayIcon from '@mui/icons-material/Replay';
import HelpIcon from '@mui/icons-material/Help'; // 引入帮助图标


export default function GitUtil() {

  const [alertOpen, setAlterOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const [folderPaths, setFolderPaths] = useState([]);
  const [progress, setProgress] = useState(0);
  const [output, setOutput] = useState('');
  const [commitMessage, setCommitMessage] = useState(''); // 新增状态管理提交信息

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlterOpen(false);
  };

  function updateProgress(current, total) {
    const newProgress = (current / total) * 100;
    setProgress(newProgress);
  }

  async function handleFolderSelect(event) {
    try {
      const paths = await open({
        directory: true,
        multiple: true
      });
      // 使用 Set 来去除重复的路径
      const uniquePaths = new Set([...folderPaths, ...paths]);
      setFolderPaths([...uniquePaths]);
    } catch (error) {
      console.log(error)
    }
  }

  function removeFolderPath(path) {
    setFolderPaths(folderPaths.filter(p => p !== path));
  }

  function extractBranchNumber(commitMessage) {
    // 匹配完整的 URL 格式
    const regex = /https:\/\/devops\.aliyun\.com\/projex\/req\/([A-Z0-9-]+)#/;
    const match = commitMessage.match(regex);
    if (match && match[1]) {
      return match[1];  // 返回匹配的分支号
    } else {
      return null;  // 如果没有匹配，返回 null
    }
  }
  async function executeTaskWithFolderPaths(taskName, taskFunction) {
    const total = folderPaths.length;
    if (total === 0) {
      setAlertMessage('没有指定任何文件夹路径，请添加至少一个文件夹路径。');
      setAlterOpen(true);
      return;
    }
    if (!commitMessage || commitMessage.length === 0) {
      setAlertMessage('提交信息不能为空。');
      setAlterOpen(true);
      return;
    }

    const branchNumber = extractBranchNumber(commitMessage);
    if (!branchNumber) {
      setAlertMessage('无法找到有效的分支号。');
      setAlterOpen(true);
      return;
    }

    let temp = 0.0;
    updateProgress(temp, total);
    for (const folderPath of folderPaths) {
      try {
        let folderPathTemp = folderPath.replaceAll('\\', "\\\\");
        await taskFunction(folderPathTemp, branchNumber);
        updateProgress(++temp, total);
      } catch (error) {
        console.error(`Error executing ${taskName}:`, error);
        alert(error);
        break; // Stop processing further if one fails
      }
    }
    setOutput(output + `\r\n[${taskName}]: ` + folderPaths.map(p => p.substring(p.lastIndexOf('\\') + 1)).join(','));
  }

  async function rebaseToMaster(folderPathTemp) {
    await invoke('execute_rebase_to_master_script', {filePath: folderPathTemp});
  }

  async function commitAndPush(folderPathTemp, branchNumber) {
    await invoke('execute_commit_and_push_script', {filePath: folderPathTemp, branch: '#' + branchNumber, commitMessage: commitMessage});
  }

  async function commitBranch(folderPathTemp, branchNumber) {
    await invoke('execute_commit_script', {filePath: folderPathTemp, branch: '#' + branchNumber, commitMessage: commitMessage});
  }

  async function deleteRemoteBranch(folderPathTemp, branchNumber) {
    await invoke('execute_delete_remote_script', {filePath: folderPathTemp, branch: '#' + branchNumber, commitMessage: commitMessage});
  }

  async function handleRebaseToMaster() {
    await executeTaskWithFolderPaths('重置到master', rebaseToMaster);
  }

  async function handleCommitAndPushBranch() {
    await executeTaskWithFolderPaths('提交推送', commitAndPush);
  }

  async function handleCommitBranch() {
    await executeTaskWithFolderPaths('仅提交', commitBranch);
  }

  async function handleDeleteRemoteBranch() {
    await executeTaskWithFolderPaths('删除远程分支', deleteRemoteBranch);
  }

  return (
    <>
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{width: '100%'}}>
          {alertMessage}
        </Alert>
      </Snackbar>

      <Container>
        <TitleTypography variant="h5" gutterBottom>
          Git 批量工具
        </TitleTypography>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Stack flex={1} spacing={2}>
            <FileUploadContainer>
              <FileChipContainer>
                {folderPaths.map((path) => (
                  <Chip
                    key={path}
                    label={path}
                    onDelete={() => removeFolderPath(path)}
                    color="primary"
                    deleteIcon={<DeleteIcon/>}
                  />
                ))}
              </FileChipContainer>
              <ButtonColumn>
                <Button variant="contained" color="primary" onClick={handleFolderSelect} startIcon={<FolderOpenIcon/>}>
                  文件夹
                </Button>
                <Button variant="contained" color="error" onClick={() => setFolderPaths([])} startIcon={<ClearIcon/>}>
                  清空
                </Button>
              </ButtonColumn>
            </FileUploadContainer>
          </Stack>
          <Stack flex={1} spacing={2}>
            <TextField
              label="提交信息"
              multiline
              rows={4} // 设置最小行数为4行
              variant="outlined"
              fullWidth
              margin="normal"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      title={
                        <React.Fragment>
                          复制阿里云任务<br />
                          例如: https://devops.aliyun.com/projex/req/SPXT-16096#《亚马逊批量调价-统一设置：增加按固定值增加/减少》
                        </React.Fragment>
                      }
                    >
                      <IconButton>
                        <HelpIcon color="primary"/>
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Stack>
        </Stack>

        <StyledLinearProgress variant="determinate" value={progress}/>

        <Stack direction="row" spacing={2}>

          <Button
            variant="contained"
            color="success"
            onClick={handleCommitAndPushBranch}
            startIcon={<UploadIcon/>}
            sx={{fontSize: '0.875rem', padding: '6px 12px', width: 'auto'}}
          >
            提交推送
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={handleCommitBranch}
            startIcon={<UploadIcon/>}
            sx={{fontSize: '0.875rem', padding: '6px 12px', width: 'auto'}}
          >
            仅提交
          </Button>

          {/* 删除按钮 */}
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteRemoteBranch}
            startIcon={<DeleteIcon/>}
            sx={{fontSize: '0.875rem', padding: '6px 12px', width: 'auto'}}
          >
            删除远程分支
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleRebaseToMaster}
            startIcon={<ReplayIcon/>}
            style={{ textTransform: 'none', fontSize: '0.875rem', padding: '6px 12px', width: 'auto' }}
          >
            重置到master
          </Button>

          <Button variant="outlined" color="error" onClick={() => setOutput('')} startIcon={<ClearIcon/>}>
            清空日志
          </Button>
          {/*<Button variant="outlined" color="error" onClick={() => setOutput(output + '\r\n9527')}*/}
          {/*        startIcon={<PrintIcon/>}>*/}
          {/*  打印日志*/}
          {/*</Button>*/}

        </Stack>

        <Paper style={{
          height: '200px',
          overflowY: 'auto',
          margin: '10px 0px',
          backgroundColor: '#333',
          color: '#ccc',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderRadius: '4px'
        }}>
          <Typography variant="body1" style={{margin: '20px', whiteSpace: 'pre-wrap'}}>{output}</Typography>
        </Paper>
      </Container>
    </>
  );
}


const Container = styled('div')({
  backgroundColor: '#fff',
  color: '#333',
  padding: '20px',
  fontFamily: 'Arial, sans-serif'
});

const FileUploadContainer = styled('div')({
  display: 'flex', // 使用 Flexbox 布局
  justifyContent: 'space-between', // 元素之间平均分布
  alignItems: 'center', // 垂直居中
  border: '1px solid #ddd',
  padding: '20px',
  marginBottom: '20px',
  boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
});

const FileChipContainer = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '10px'
});

const ButtonColumn = styled('div')({
  display: 'flex',
  flexDirection: 'column', // 按钮垂直排列
  gap: '10px', // 按钮之间的间隔
});

const TitleTypography = styled(Typography)({
  color: '#1976d2',
  fontWeight: 'bold',
  marginBottom: '20px',
  padding: '10px',
  backgroundColor: '#ffffff',
});

const StyledLinearProgress = styled(LinearProgress)({
  height: '10px', // 增加进度条的高度
  borderRadius: '5px', // 可选：添加圆角效果
  margin: '20px'
});
