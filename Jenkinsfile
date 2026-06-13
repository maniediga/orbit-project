pipeline {
agent any

```
stages {

    stage('Checkout') {
        steps {
            checkout scm
        }
    }

    stage('Check Node') {
        steps {
            bat '''
            where node
            where npm
            node -v
            npm -v
            '''
        }
    }

    stage('Install Frontend Dependencies') {
        steps {
            dir('frontend') {
                bat 'npm install'
            }
        }
    }

    stage('Build Frontend') {
        steps {
            dir('frontend') {
                bat 'npm run build'
            }
        }
    }

    stage('Install Server Dependencies') {
        steps {
            dir('server') {
                bat 'npm install'
            }
        }
    }

    stage('SonarQube Analysis') {
        environment {
            scannerHome = tool 'sonarqube_scanner'
        }
        steps {
            withSonarQubeEnv('sonarqube_server') {
                bat """
                %scannerHome%\\bin\\sonar-scanner.bat ^
                -Dsonar.projectKey=project-management ^
                -Dsonar.projectName=project-management ^
                -Dsonar.sources=frontend/src,server ^
                -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/build/**
                """
            }
        }
    }
}

post {
    success {
        echo 'Pipeline completed successfully.'
    }

    failure {
        echo 'Pipeline failed.'
    }
}
```

}
