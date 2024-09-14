import { useRouter } from "next/router";
import { DocumentsList } from "@/layouts/Documents/DocumentsList"; // Assuming your DocumentList is in this path

const CategoryPage = () => {
  const router = useRouter();
  const { category } = router.query;

  if (!category) return null;

  // Assuming "all" is your default category
  const selectedCategory = category as string;

  return (
    <div>
      <h1>{selectedCategory}</h1>
      {/* Pass the selected category to your DocumentsList component */}
      <DocumentsList category={selectedCategory} />
    </div>
  );
};

export default CategoryPage;
