import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaBuilding, FaHashtag, FaChalkboardTeacher, FaCamera, FaLinkedin, FaGithub } from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';
import Loading from '../components/Loading';

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    rollNumber: '',
    class: '',
    linkedin: '',
    leetcode: '',
    github: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        rollNumber: user.rollNumber || '',
        class: user.class || '',
        linkedin: user.linkedin || '',
        leetcode: user.leetcode || '',
        github: user.github || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const profileData = {
      name: formData.name,
      linkedin: formData.linkedin,
      leetcode: formData.leetcode,
      github: formData.github,
    };
    if (user.role === 'teacher') {
      profileData.department = formData.department;
    }
    if (user.role === 'student') {
      profileData.rollNumber = formData.rollNumber;
      profileData.class = formData.class;
    }
    await updateProfile(profileData);
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Please log in to see your profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="w-full md:w-1/3 bg-gray-50 dark:bg-dark-700 p-8 flex flex-col items-center justify-center">
              <div className="relative">
                <img
                  className="w-32 h-32 rounded-full object-cover shadow-md"
                  src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  alt="Profile"
                />
                <button className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 text-white hover:bg-indigo-700 transition-colors">
                  <FaCamera />
                </button>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">{user.name}</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">{user.role}</span>
            </div>
            <div className="w-full md:w-2/3 p-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Edit Profile
              </h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <FaUser className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="pl-12 w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                  />
                </div>
                <div className="relative">
                  <FaEnvelope className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    placeholder="Email"
                    className="pl-12 w-full border-gray-300 rounded-lg shadow-sm bg-gray-100 dark:bg-dark-600 dark:border-dark-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                {user.role === 'teacher' && (
                  <div className="relative">
                    <FaBuilding className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Department"
                      className="pl-12 w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                    />
                  </div>
                )}

                {user.role === 'student' && (
                  <>
                    <div className="relative">
                      <FaHashtag className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                      <input
                        type="text"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleChange}
                        placeholder="Roll Number"
                        className="pl-12 w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                      />
                    </div>
                    <div className="relative">
                      <FaChalkboardTeacher className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                      <input
                        type="text"
                        name="class"
                        value={formData.class}
                        onChange={handleChange}
                        placeholder="Class"
                        className="pl-12 w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                      />
                    </div>
                  </>
                )}

                {/* Social Links */}
                <div className="relative">
                  <FaLinkedin className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="LinkedIn Profile URL"
                    className="pl-12 w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                  />
                </div>
                <div className="relative">
                  <SiLeetcode className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                  <input
                    type="text"
                    name="leetcode"
                    value={formData.leetcode}
                    onChange={handleChange}
                    placeholder="LeetCode Profile URL"
                    className="pl-12 w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                  />
                </div>
                <div className="relative">
                  <FaGithub className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                  <input
                    type="text"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="GitHub Profile URL"
                    className="pl-12 w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                  />
                </div>


                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-dark-800 transition-transform transform hover:scale-105"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;