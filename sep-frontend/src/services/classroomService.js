import axiosClient from '../api/axiosClient';

const classroomService = {
    getAllClassrooms: async () => {
        const response = await axiosClient.get('/classrooms');
        return response.data;
    },
    createClassroom: async (data) => {
        // data gồm: classCode, subjectId, lecturerId
        const response = await axiosClient.post('/classrooms', data);
        return response.data;
    },
    deleteClassroom: async (id) => {
        const response = await axiosClient.delete(`/classrooms/${id}`);
        return response.data;
    }
};

export default classroomService;