const GIST_FILENAME = 'embedlink_backup.json';
const GIST_DESCRIPTION = 'EmbedLink Data Backup';

export const saveToGist = async (token: string, data: any) => {
  if (!token) throw new Error("GitHub Token 不能为空");

  // 1. Get current user (check token validity)
  const userRes = await fetch('https://api.github.com/user', {
    headers: { 
      Authorization: `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!userRes.ok) {
    if (userRes.status === 401) throw new Error("Token 无效或已过期");
    throw new Error("连接 GitHub 失败");
  }

  // 2. Search for existing gist
  const gistsRes = await fetch('https://api.github.com/gists', {
    headers: { 
      Authorization: `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  if (!gistsRes.ok) throw new Error("无法获取 Gist 列表，请检查 Token 是否勾选了 'gist' 权限");

  const gists = await gistsRes.json();
  const existingGist = gists.find((g: any) => g.description === GIST_DESCRIPTION);
  const content = JSON.stringify(data, null, 2);

  if (existingGist) {
    // Update
    const updateRes = await fetch(`https://api.github.com/gists/${existingGist.id}`, {
      method: 'PATCH',
      headers: { 
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        description: GIST_DESCRIPTION,
        files: { [GIST_FILENAME]: { content } }
      })
    });
    if (!updateRes.ok) throw new Error("更新备份失败");
  } else {
    // Create
    const createRes = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: { 
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        description: GIST_DESCRIPTION,
        public: false, // Private gist
        files: { [GIST_FILENAME]: { content } }
      })
    });
    if (!createRes.ok) throw new Error("创建备份失败，请检查 Token 权限");
  }
};

export const loadFromGist = async (token: string) => {
  if (!token) throw new Error("GitHub Token 不能为空");

  const response = await fetch('https://api.github.com/gists', {
    headers: { 
      Authorization: `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("Token 无效");
    throw new Error("无法获取 Gist 列表");
  }

  const gists = await response.json();
  const existingGist = gists.find((g: any) => g.description === GIST_DESCRIPTION);
  
  if (!existingGist || !existingGist.files[GIST_FILENAME]) {
    throw new Error("未找到 EmbedLink 的备份文件。请先执行【上传备份】操作。");
  }

  const fileUrl = existingGist.files[GIST_FILENAME].raw_url;
  const dataResponse = await fetch(fileUrl);
  const data = await dataResponse.json();
  return data;
};