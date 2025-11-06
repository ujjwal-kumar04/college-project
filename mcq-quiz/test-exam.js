const axios = require('axios');

// First login as a teacher to get token
async function testExamCreation() {
    try {
        // Login
        const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'teacher@example.com',
            password: 'password123'
        });

        const token = loginResponse.data.token;
        console.log('Login successful, token received');

        // Create exam
        const examData = {
            title: 'Test Exam',
            subject: 'Computer Science',
            description: 'Test exam description',
            duration: 60,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
            questions: [
                {
                    question: 'What is 2+2?',
                    options: ['3', '4', '5', '6'],
                    correctAnswer: 1
                }
            ]
        };

        const examResponse = await axios.post('http://localhost:5001/api/exams', examData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Exam created successfully!');
        console.log('Exam Key:', examResponse.data.examKey);
        console.log('Exam ID:', examResponse.data._id);

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testExamCreation();