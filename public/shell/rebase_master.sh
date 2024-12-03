#!/bin/bash

# 获取传入的目录参数
DIR="D:\javaprogram"

echo "Start to delete..."
echo "Working in directory: $DIR"

# 保存当前目录
original_dir=$DIR

# 循环指定目录下的文件和文件夹
for file in "$DIR"/*
do
    if [ -d "$file" ]; then
        echo "$file is a directory"
        cd "$file"

        # 检查是否是git仓库
        if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
            # 切换到master分支
            git checkout -f master
            # 删除除master外的所有本地分支
            git branch | grep -v "master" | xargs -r git branch -D
        else
            echo "$file is not a git repository..."
        fi

        # 返回到原始目录
        cd "$original_dir"
    elif [ -f "$file" ]; then
        echo "$file is a file"
    fi
done

echo "Success"

sleep 5
