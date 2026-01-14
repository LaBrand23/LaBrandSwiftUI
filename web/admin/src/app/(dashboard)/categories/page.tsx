'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService, CategoriesQueryParams, CreateCategoryPayload } from '@shared/services/categories.service';
import { Category, Gender } from '@shared/types';
import { useUIStore } from '@shared/stores/uiStore';
import { PageHeader } from '@shared/components/layouts/PageHeader';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Badge } from '@shared/components/ui/Badge';
import { Card } from '@shared/components/ui/Card';
import { Modal } from '@shared/components/ui/Modal';
import { Spinner } from '@shared/components/ui/Spinner';
import { Select } from '@shared/components/ui/Select';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

type ViewMode = 'tree' | 'list';

interface CategoryFormData {
  name: string;
  slug: string;
  parent_id: string;
  gender: Gender | '';
  image_url: string;
  position: number;
  is_active: boolean;
}

const initialFormData: CategoryFormData = {
  name: '',
  slug: '',
  parent_id: '',
  gender: '',
  image_url: '',
  position: 0,
  is_active: true,
};

const genderOptions = [
  { value: '', label: 'All Genders' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'kids', label: 'Kids' },
  { value: 'unisex', label: 'Unisex' },
];

const genderLabels: Record<Gender, string> = {
  men: 'Men',
  women: 'Women',
  kids: 'Kids',
  unisex: 'Unisex',
};

const genderColors: Record<Gender, 'info' | 'error' | 'warning' | 'success'> = {
  men: 'info',
  women: 'error',
  kids: 'warning',
  unisex: 'success',
};

function CategoryTreeItem({
  category,
  level = 0,
  onEdit,
  onDelete,
  onToggleActive,
  expandedIds,
  toggleExpand,
}: {
  category: Category;
  level?: number;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onToggleActive: (cat: Category) => void;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.has(category.id);

  return (
    <div>
      <div
        className={`flex items-center gap-3 py-3 px-4 hover:bg-neutral-50 border-b border-neutral-100 ${
          level > 0 ? 'bg-neutral-25' : ''
        }`}
        style={{ paddingLeft: `${1 + level * 1.5}rem` }}
      >
        <button
          onClick={() => hasChildren && toggleExpand(category.id)}
          className={`w-5 h-5 flex items-center justify-center ${
            hasChildren ? 'text-neutral-500 hover:text-neutral-700' : 'invisible'
          }`}
        >
          {hasChildren &&
            (isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            ))}
        </button>

        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden">
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <FolderIcon className="w-5 h-5 text-neutral-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-900">{category.name}</span>
            {category.gender && (
              <Badge variant={genderColors[category.gender]} size="sm">
                {genderLabels[category.gender]}
              </Badge>
            )}
          </div>
          <p className="text-sm text-neutral-500">/{category.slug}</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500">
            {category.products_count || 0} products
          </span>

          <Badge variant={category.is_active ? 'success' : 'neutral'} size="sm">
            {category.is_active ? 'Active' : 'Inactive'}
          </Badge>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleActive(category)}
              className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title={category.is_active ? 'Deactivate' : 'Activate'}
            >
              <span className="text-xs font-medium">
                {category.is_active ? 'Deactivate' : 'Activate'}
              </span>
            </button>
            <button
              onClick={() => onEdit(category)}
              className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(category)}
              className="p-2 text-neutral-500 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<Gender | ''>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);

  // Fetch categories tree
  const { data: categoriesTree = [], isLoading: isLoadingTree } = useQuery({
    queryKey: ['categories', 'tree', genderFilter],
    queryFn: () => categoriesService.getTree(genderFilter || undefined),
    enabled: viewMode === 'tree',
  });

  // Fetch categories list
  const queryParams: CategoriesQueryParams = {
    search: searchQuery || undefined,
    gender: genderFilter || undefined,
    limit: 100,
  };

  const { data: categoriesList, isLoading: isLoadingList } = useQuery({
    queryKey: ['categories', 'list', queryParams],
    queryFn: () => categoriesService.getAll(queryParams),
    enabled: viewMode === 'list',
  });

  // Fetch root categories for parent selection
  const { data: rootCategories = [] } = useQuery({
    queryKey: ['categories', 'root'],
    queryFn: () => categoriesService.getRootCategories(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      categoriesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      addToast('Category created successfully', 'success');
      closeModal();
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to create category', 'error');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateCategoryPayload }) =>
      categoriesService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      addToast('Category updated successfully', 'success');
      closeModal();
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to update category', 'error');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      addToast('Category deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to delete category', 'error');
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      categoriesService.toggleActive(id, is_active),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      addToast(
        `Category ${variables.is_active ? 'activated' : 'deactivated'} successfully`,
        'success'
      );
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to update category', 'error');
    },
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (categories: Category[]) => {
      categories.forEach((cat) => {
        if (cat.children && cat.children.length > 0) {
          allIds.add(cat.id);
          collectIds(cat.children);
        }
      });
    };
    collectIds(categoriesTree);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const openCreateModal = (parentId?: string) => {
    setSelectedCategory(null);
    setFormData({
      ...initialFormData,
      parent_id: parentId || '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id || '',
      gender: category.gender || '',
      image_url: category.image_url || '',
      position: category.position,
      is_active: category.is_active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setFormData(initialFormData);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleToggleActive = (category: Category) => {
    toggleActiveMutation.mutate({
      id: category.id,
      is_active: !category.is_active,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateCategoryPayload = {
      name: formData.name,
      slug: formData.slug || undefined,
      parent_id: formData.parent_id || undefined,
      gender: formData.gender || undefined,
      image_url: formData.image_url || undefined,
      position: formData.position,
      is_active: formData.is_active,
    };

    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  };

  const isLoading = viewMode === 'tree' ? isLoadingTree : isLoadingList;
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  // Build parent options for select
  const parentOptions = [
    { value: '', label: 'No Parent (Root Category)' },
    ...rootCategories
      .filter((cat) => cat.id !== selectedCategory?.id)
      .map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage product categories and hierarchy"
        actions={
          <Button onClick={() => openCreateModal()}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Category
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <Select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as Gender | '')}
            options={genderOptions}
            className="w-40"
          />

          <div className="flex items-center gap-2 border-l pl-4">
            <button
              onClick={() => setViewMode('tree')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'tree'
                  ? 'bg-primary-100 text-primary-600'
                  : 'text-neutral-500 hover:bg-neutral-100'
              }`}
              title="Tree View"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-100 text-primary-600'
                  : 'text-neutral-500 hover:bg-neutral-100'
              }`}
              title="List View"
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>

          {viewMode === 'tree' && (
            <div className="flex items-center gap-2 border-l pl-4">
              <Button variant="ghost" size="sm" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="ghost" size="sm" onClick={collapseAll}>
                Collapse All
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Categories Display */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : viewMode === 'tree' ? (
          <div className="divide-y divide-neutral-100">
            {categoriesTree.length === 0 ? (
              <div className="text-center py-12">
                <FolderIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  No categories yet
                </h3>
                <p className="text-neutral-500 mb-4">
                  Create your first category to organize products.
                </p>
                <Button onClick={() => openCreateModal()}>
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Category
                </Button>
              </div>
            ) : (
              categoriesTree.map((category) => (
                <CategoryTreeItem
                  key={category.id}
                  category={category}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  onToggleActive={handleToggleActive}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                />
              ))
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    Parent
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    Gender
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    Products
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categoriesList?.categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden">
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FolderIcon className="w-5 h-5 text-neutral-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {category.name}
                          </p>
                          <p className="text-sm text-neutral-500">
                            /{category.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      {category.parent_id ? (
                        rootCategories.find((c) => c.id === category.parent_id)
                          ?.name || '-'
                      ) : (
                        <span className="text-neutral-400">Root</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {category.gender ? (
                        <Badge
                          variant={genderColors[category.gender]}
                          size="sm"
                        >
                          {genderLabels[category.gender]}
                        </Badge>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      {category.products_count || 0}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={category.is_active ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleActive(category)}
                          className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-xs"
                        >
                          {category.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
                          className="p-2 text-neutral-500 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedCategory ? 'Edit Category' : 'Create Category'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Dresses"
            required
          />

          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="auto-generated if empty"
            helper="URL-friendly identifier (e.g., dresses)"
          />

          <Select
            label="Parent Category"
            value={formData.parent_id}
            onChange={(e) =>
              setFormData({ ...formData, parent_id: e.target.value })
            }
            options={parentOptions}
          />

          <Select
            label="Gender"
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value as Gender | '' })
            }
            options={genderOptions}
          />

          <Input
            label="Image URL"
            value={formData.image_url}
            onChange={(e) =>
              setFormData({ ...formData, image_url: e.target.value })
            }
            placeholder="https://..."
          />

          <Input
            label="Position"
            type="number"
            value={formData.position.toString()}
            onChange={(e) =>
              setFormData({ ...formData, position: parseInt(e.target.value) || 0 })
            }
            helper="Lower numbers appear first"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700">Active</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isMutating}>
              {selectedCategory ? 'Update' : 'Create'} Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Category"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to delete{' '}
            <span className="font-medium text-neutral-900">
              {selectedCategory?.name}
            </span>
            ? This action cannot be undone.
          </p>

          {selectedCategory?.children && selectedCategory.children.length > 0 && (
            <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="text-sm text-warning-800">
                This category has {selectedCategory.children.length} subcategories
                that will also be affected.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete Category
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
