import * as React from 'react';
import { styled } from '@mui/material/styles';
import { useState } from "react";
import { open } from '@tauri-apps/plugin-dialog';
import { Button, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { Command } from '@tauri-apps/plugin-shell';
import { invoke } from "@tauri-apps/api/core";



export default function GitUtil() {

  const Container = styled('div')({
    backgroundColor: '#fff', // 白色背景
    color: '#333', // 深灰色文字，提高可读性
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  });

  const FileUploadContainer = styled('div')({
    border: '1px solid #ddd', // 浅灰色边框
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.2)', // 添加阴影
  });

  const FileChipContainer = styled('div')({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '10px'
  });

  const TitleTypography = styled(Typography)({
    color: '#1976d2', // 蓝色标题
    fontWeight: 'bold',  // 加粗字体
    marginBottom: '20px', // 底部边距
    padding: '10px', // 增加内边距
    backgroundColor: '#ffffff', // 背景颜色
  });



  const [folderPaths, setFolderPaths] = useState([]);
  const [progress, setProgress] = useState(0);
  const [output, setOutput] = useState('output');

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
      setFolderPaths([...folderPaths, ...paths]);
    } catch (error) {
      console.log(error)
    }
  }

  function removeFolderPath(path) {
    setFolderPaths(folderPaths.filter(p => p !== path));
  }

  async function logCommand() {
    const total = folderPaths.length;
    let temp = 0.0;
    updateProgress(temp, total);
    for (const folderPath of folderPaths) {
      try {

        alert(1)
        const result = await invoke('execute_shell_script', { filePath: folderPath });
        alert(1)



        // 使用数组参数避免潜在的命令注入
        await Command.create('exec-cmd', [
          '-c',
          `echo ${folderPath}`
        ]).execute().then(value => {
          setOutput(output + '\r\n' + value.stdout.toString());
          updateProgress(++temp, total);
        });
      } catch (error) {
        console.error('Error executing command:', error);
        alert(error)
      }
    }
  }

  return (
    <Container>
      <TitleTypography variant="h5" gutterBottom>
        Git 批量工具
      </TitleTypography>
      <FileUploadContainer>
        <Button variant="contained" color="primary" onClick={handleFolderSelect}>
          选择文件夹
        </Button>
        <FileChipContainer>
          {folderPaths.map((path) => (
            <Chip
              key={path}
              label={path}
              onDelete={() => removeFolderPath(path)}
              color="primary"
            />
          ))}
        </FileChipContainer>
      </FileUploadContainer>
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" color="error" onClick={() => setFolderPaths([])}>清空选择</Button>
        <Button variant="outlined" color="info" style={{ textTransform: 'none' }} onClick={() => logCommand()}>重置到Master</Button>
        <Button variant="outlined" color="error" onClick={() => setOutput('')}>清空日志</Button>

      </Stack>

      <LinearProgress variant="determinate" value={progress} />
      <Typography variant="body1">{output}</Typography>

    </Container>
  );
}
