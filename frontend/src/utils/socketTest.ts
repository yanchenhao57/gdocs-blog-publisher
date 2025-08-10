import documentSocketService from '../services/documentSocket';

/**
 * Socket服务测试工具
 * 用于测试和调试Socket连接
 */
export class SocketTestUtil {
    private static instance: SocketTestUtil;
    private testResults: Map<string, any> = new Map();

    static getInstance(): SocketTestUtil {
        if (!SocketTestUtil.instance) {
            SocketTestUtil.instance = new SocketTestUtil();
        }
        return SocketTestUtil.instance;
    }

    /**
     * 测试Socket连接
     */
    async testConnection(): Promise<boolean> {
        try {
            console.log('开始测试Socket连接...');

            // 测试连接
            await documentSocketService.connect();
            const isConnected = documentSocketService.isConnected();

            if (isConnected) {
                console.log('✅ Socket连接成功');
                this.testResults.set('connection', { success: true, message: '连接成功' });
                return true;
            } else {
                console.log('❌ Socket连接失败');
                this.testResults.set('connection', { success: false, message: '连接失败' });
                return false;
            }
        } catch (error) {
            console.error('❌ Socket连接测试出错:', error);
            this.testResults.set('connection', { success: false, message: `连接错误: ${error}` });
            return false;
        }
    }

    /**
     * 测试事件监听
     */
    testEventListening(): boolean {
        try {
            console.log('开始测试事件监听...');

            let eventReceived = false;
            const testEvent = 'test:event';

            // 添加测试事件监听器
            const unsubscribe = documentSocketService.on('googleDocs:fetch:start' as any, (data: any) => {
                eventReceived = true;
                console.log('✅ 收到测试事件:', data);
            });

            // 模拟发送测试事件（这里只是测试监听器设置）
            setTimeout(() => {
                if (eventReceived) {
                    console.log('✅ 事件监听测试通过');
                    this.testResults.set('eventListening', { success: true, message: '事件监听正常' });
                } else {
                    console.log('❌ 事件监听测试失败');
                    this.testResults.set('eventListening', { success: false, message: '事件监听失败' });
                }
                unsubscribe();
            }, 1000);

            return true;
        } catch (error) {
            console.error('❌ 事件监听测试出错:', error);
            this.testResults.set('eventListening', { success: false, message: `事件监听错误: ${error}` });
            return false;
        }
    }

    /**
     * 测试消息发送
     */
    testMessageSending(): boolean {
        try {
            console.log('开始测试消息发送...');

            if (!documentSocketService.isConnected()) {
                console.log('❌ Socket未连接，无法测试消息发送');
                this.testResults.set('messageSending', { success: false, message: 'Socket未连接' });
                return false;
            }

            // 测试发送消息
            (documentSocketService as any).socketService.emit('test:message', { test: true, timestamp: Date.now() });
            console.log('✅ 测试消息发送成功');
            this.testResults.set('messageSending', { success: true, message: '消息发送正常' });
            return true;
        } catch (error) {
            console.error('❌ 消息发送测试出错:', error);
            this.testResults.set('messageSending', { success: false, message: `消息发送错误: ${error}` });
            return false;
        }
    }

    /**
     * 运行所有测试
     */
    async runAllTests(): Promise<Map<string, any>> {
        console.log('🚀 开始运行Socket服务测试...');

        // 清空之前的测试结果
        this.testResults.clear();

        // 测试连接
        await this.testConnection();

        // 如果连接成功，继续其他测试
        if (this.testResults.get('connection')?.success) {
            this.testEventListening();
            this.testMessageSending();
        }

        // 等待一段时间让异步测试完成
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('📊 测试结果:', this.testResults);
        return this.testResults;
    }

    /**
     * 获取测试结果
     */
    getTestResults(): Map<string, any> {
        return this.testResults;
    }

    /**
     * 生成测试报告
     */
    generateTestReport(): string {
        let report = '📋 Socket服务测试报告\n';
        report += '='.repeat(30) + '\n\n';

        this.testResults.forEach((result, testName) => {
            const status = result.success ? '✅' : '❌';
            report += `${status} ${testName}: ${result.message}\n`;
        });

        const totalTests = this.testResults.size;
        const passedTests = Array.from(this.testResults.values()).filter(r => r.success).length;
        const failedTests = totalTests - passedTests;

        report += '\n' + '='.repeat(30) + '\n';
        report += `总计: ${totalTests} | 通过: ${passedTests} | 失败: ${failedTests}\n`;

        return report;
    }

    /**
     * 清理测试环境
     */
    cleanup(): void {
        try {
            documentSocketService.disconnect();
            this.testResults.clear();
            console.log('🧹 测试环境清理完成');
        } catch (error) {
            console.error('清理测试环境时出错:', error);
        }
    }
}

// 导出单例实例
export const socketTestUtil = SocketTestUtil.getInstance();

// 导出便捷的测试函数
export const runSocketTests = () => socketTestUtil.runAllTests();
export const getSocketTestResults = () => socketTestUtil.getTestResults();
export const generateSocketTestReport = () => socketTestUtil.generateTestReport();
export const cleanupSocketTests = () => socketTestUtil.cleanup(); 