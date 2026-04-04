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

        stage('Đóng gói Front-end') {
            steps {
                script {
                    // Build Image từ Dockerfile trong thư mục gốc của Repo FE
                    docker.withRegistry('', DOCKER_HUB_CREDS_ID) {
                        def feImage = docker.build("${IMAGE_NAME}:latest", ".")
                        feImage.push()
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
