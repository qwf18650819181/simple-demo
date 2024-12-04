#!/bin/bash
# 检查是否有传入目录参数
if [ -z "\$1" ]; then
    echo "Usage: \$0 <directory>"
    exit 1
fi

# 获取传入的目录参数
DIR=$1

echo "Start to delete..."
echo "Working in directory: $DIR"

if [ -d "$DIR" ]; then
    echo "$DIR is a directory"
    cd "$DIR" || exit  # 如果无法进入目录，则退出脚本

    # 检查是否是git仓库
    if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        # 切换到master分支
        git checkout master
        # 删除除master外的所有本地分支
        git branch | grep -v "master" | xargs -r git branch -D
        # 拉取最新的远程master分支
        git fetch origin master
        # Rebase当前的master分支到最新的远程master
        git rebase origin/master
    else
        echo "$DIR is not a git repository..."
    fi
elif [ -f "$DIR" ]; then
    echo "$DIR is a file"
fi

echo "Success"

sleep 5
