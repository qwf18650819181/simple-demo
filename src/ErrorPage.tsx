import { Button, Link } from "@mui/material";
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export default function ErrorPage() {

  const CenteredContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column', // 改为列布局
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.background.default, // 使用主题中的背景颜色
  }));

// 定义一个自定义的按钮，应用特定的样式
  const StyledButton = styled(Button)(({ theme }) => ({
    fontSize: '16px',
    padding: '10px 20px',
    borderRadius: '5px',
    marginTop: theme.spacing(4), // 添加 margin-top 以便与上方的文字有间距
    ':hover': {
      backgroundColor: theme.palette.primary.dark, // 使用主题中的颜色
    }
  }));

// 定义一个自定义的链接，应用特定的样式
  const StyledLink = styled(Link)({
    fontWeight: 'bold',
    color: 'white',
    ':hover': {
      textDecoration: 'underline',
    }
  });

// 大号的 404 文字样式
  const Big404 = styled(Typography)({
    fontSize: '10rem', // 大号字体
    fontWeight: 'bold',
    color: '#333', // 深色字体
  });

  return (
    <CenteredContainer>
      <Big404>404</Big404>
      <StyledButton variant="contained" color="primary">
        <StyledLink href="/" underline="none">
          返回首页
        </StyledLink>
      </StyledButton>
    </CenteredContainer>
  )
}

