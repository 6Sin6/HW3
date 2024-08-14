import { useState, useEffect } from 'preact/hooks';
import { useGlobal } from '/src/context/GlobalContext'; // Import useGlobal hook for accessing global variables
import { route } from 'preact-router'; // Import route for navigation
import { ref, onValue, remove } from 'firebase/database'; // Import necessary Firebase functions
import { database } from '../firebase'; // Import Firebase database instance

const EditQuiz = () => {
  const [quizzes, setQuizzes] = useState([]); // State to store quizzes fetched from the database
  const { state } = useGlobal(); // Access global state variables

  // useEffect hook to check if the user is logged in
  useEffect(() => {
    if (!state.GlobalVarIsLoggedIn) {
      route('/'); // Redirect to the home page if the user is not logged in
    }
  }, [state.GlobalVarIsLoggedIn]); // Dependency array ensures this effect runs when the login state changes

  // useEffect hook to fetch quizzes data from Firebase
  useEffect(() => {
    const fetchQuizzes = () => {
      const quizzesRef = ref(database, 'quizzes'); // Reference to the 'quizzes' node in the database
      onValue(quizzesRef, (snapshot) => {
        const data = snapshot.val(); // Retrieve quizzes data from the snapshot
        if (data) {
          // Map over the data and set the quizzes state with the retrieved quizzes
          setQuizzes(Object.keys(data).map(key => ({ ...data[key], id: key })));
        } else {
          setQuizzes([]); // If no data is found, set quizzes to an empty array
        }
      });
    };

    fetchQuizzes(); // Call the fetchQuizzes function to retrieve the data
  }, []); // Empty dependency array ensures this effect runs only once after the component mounts

  // Function to handle back button click
  const handleBackClick = () => {
    route('/welcome'); // Navigate to the welcome page
  };

  // Function to handle quiz deletion
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this quiz?");
    if (confirmDelete) {
      try {
        const quizRef = ref(database, `quizzes/${id}`); // Reference to the specific quiz to be deleted
        await remove(quizRef); // Remove the quiz from the database
        setQuizzes(quizzes.filter(quiz => quiz.id !== id)); // Update the quizzes state to remove the deleted quiz
      } catch (error) {
        console.error('Failed to delete quiz:', error); // Log any errors during deletion
      }
    } else {
      console.log('Quiz deletion canceled'); // Log if deletion is canceled
    }
  };

  // Function to handle editing a quiz
  const handleEdit = (quizId) => {
    route(`/change-quiz/${quizId}`); // Navigate to the ChangeQuiz component with the selected quizId
  };

  // Render the component
  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-5xl mb-5 shimmer">Edit Quizzes</h2>
      {quizzes.length > 0 ? (
        <div className="w-full max-w-lg mx-auto">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white/[0.2] p-4 rounded shadow-2xl mb-4"
            >
              <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
              <p className="mb-2">{quiz.description}</p>
              <button
                onClick={() => handleEdit(quiz.id)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl mt-2 transition duration-500 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(quiz.id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl mt-2 transition duration-500"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No quizzes available.</p>
      )}
      <button
        onClick={handleBackClick}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
      >
        Back
      </button>
    </div>
  );
};

export default EditQuiz;
