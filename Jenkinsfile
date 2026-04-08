pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = 'lehongphat'
        DOCKER_HUB_CREDS_ID = 'docker-hub-creds'
        IMAGE_NAME = "${DOCKER_HUB_USER}/primesound-frontend"
    }

    stages {
        stage('Tải mã nguồn') {
            steps {
                checkout scm
            }
        }

        stage('Đóng gói & Đẩy lên Docker Hub') {
            steps {
                // Sử dụng credentialsId để lấy username/password an toàn
                withCredentials([usernamePassword(credentialsId: "${DOCKER_HUB_CREDS_ID}", passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    script {
                        // 1. Đăng nhập Docker Hub (Dùng lệnh bat cho Windows)
                        bat "docker login -u %DOCKER_USER% -p %DOCKER_PASS%"
                        
                        // 2. Build Image
                        bat "docker build -t ${IMAGE_NAME}:latest ."
                        
                        // 3. Push Image
                        bat "docker push ${IMAGE_NAME}:latest"
                        
                        // 4. Logout để bảo mật
                        bat "docker logout"
                    }
                }
            }
        }
    }

    post {
        success {
            echo '🎉 Front-end đã được build và push thành công!'
        }
        failure {
            echo '❌ Build Front-end thất bại.'
        }
    }
}
