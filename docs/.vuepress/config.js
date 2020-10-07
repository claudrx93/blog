module.exports = {
    title: 'Blog',
    description: 'Just playing around',
    dest: './dist',
    themeConfig: {
        // displayAllHeaders: true,
        // sidebar: 'auto'
        sidebar: [
            ['项目管理/', '项目管理'],
            {
                title: '生活游记',
                path: '/生活游记/',
                sidebarDepth: 1,    // 可选的, 默认值是 1
                children: [
                    '/广东/'
                ]
            }
        ]
    }
}