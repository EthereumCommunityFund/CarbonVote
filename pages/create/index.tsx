'use client';
import CreatePollForm from '../../components/create/CreatePollForm';

/**
 * Create Poll Page
 *
 * This component loads the CreatePollForm directly, mimicking the original implementation
 * to avoid hydration issues with Suspense
 */
const CreatePollPage = () => {
  return (
    <div className="flex gap-[20px] px-[10px] sm:px-[20px] pt-10 justify-center text-black overflow-y-auto">
      <div className="w-full max-w-[800px]">
        <CreatePollForm />
      </div>
    </div>
  );
};

export default CreatePollPage;
