import isEqual from 'lodash/isEqual';
import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import {
  DataGrid,
  GridColDef,
  GridToolbarExport,
  GridActionsCellItem,
  GridToolbarContainer,
  GridRowSelectionModel,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components/routerLink';

import { useBoolean } from 'src/hooks/use-boolean';

import { useCombinedStore } from 'src/store';
import { useGetSecrets } from 'src/api/secret';
// import { useGetProducts } from 'src/api/product'
import { PRODUCT_STOCK_OPTIONS } from 'src/_mock/_product';

import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
// import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { RenderCellNsName } from './product-table-row';
import ProductTableToolbar from './product-table-toolbar';
import ProductTableFiltersResult from './product-table-filters-result';
import { IProductTableFilters, IProductTableFilterValue } from '../type';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

const PUBLISH_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

const defaultFilters: IProductTableFilters = {
  publish: [],
  stock: [],
};

const HIDE_COLUMNS = {
  category: false,
};

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export default function SecretListView() {
  const confirmRows = useBoolean();

  const router = useRouter();
  const { namespace } = useCombinedStore();

  const settings = useSettingsContext();

  const { secrets } = useGetSecrets({
    ns: namespace,
  });

  const productsLoading = false;

  const [filters, setFilters] = useState(defaultFilters);

  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);

  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(HIDE_COLUMNS);

  const dataFiltered = applyFilter({
    // inputData: tableData,
    inputData: secrets,
    filters,
  });

  const canReset = !isEqual(defaultFilters, filters);

  const handleFilters = useCallback((name: string, value: IProductTableFilterValue) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // const handleDeleteRow = useCallback(
  //   (id: string) => {
  //     const deleteRow = tableData.filter(row => row.id !== id)

  //     enqueueSnackbar('Delete success!')

  //     setTableData(deleteRow)
  //   },
  //   [enqueueSnackbar, tableData],
  // )

  // const handleDeleteRows = useCallback(() => {
  //   const deleteRows = tableData.filter(row => !selectedRowIds.includes(row.id))

  //   enqueueSnackbar('Delete success!')

  //   setTableData(deleteRows)
  // }, [enqueueSnackbar, selectedRowIds, tableData])

  const handleEditRow = useCallback((id: string) => {
    // router.push(paths.dashboard.product.edit(id))
  }, []);

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.product.details(id));
    },
    [router]
  );

  const toPod = useCallback(
    (name: string, ns: string) => () => {
      router.push(`/pod/${ns}/${name}`);
    },
    [router]
  );

  const columns: GridColDef[] = [
    // {
    //   field: 'category',
    //   headerName: 'Category',
    //   filterable: false,
    // },
    {
      field: 'Name',
      headerName: 'Name',
      flex: 1,
      // minWidth: 160,
      maxWidth: 360,
      hideable: false,

      renderCell: (params) => (
        <RenderCellNsName
          params={params}
          handleClick={toPod(params.row.Name, params.row.Namespace)}
        />
      ),
    },
    {
      field: 'Namespace',
      headerName: 'Namespace',
      width: 260,
    },

    {
      field: 'Type',
      headerName: 'Type',
      flex: 1,
      minWidth: 260,
      // renderCell: params => <RenderCellProduct params={params} />,
    },

    {
      field: 'CreateTime',
      headerName: 'Create at',
      width: 180,
      // renderCell: params => <RenderCellCreatedAt params={params} />,
    },

    {
      type: 'actions',
      field: 'actions',
      headerName: ' ',
      align: 'right',
      headerAlign: 'right',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="View"
          onClick={() => handleViewRow(params.row.Name)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:pen-bold" />}
          label="Edit"
          onClick={() => handleEditRow(params.row.Name)}
        />,
        // <GridActionsCellItem
        //   showInMenu
        //   icon={<Iconify icon="solar:trash-bin-trash-bold" />}
        //   label="Delete"
        //   onClick={() => {
        //     handleDeleteRow(params.row.id)
        //   }}
        //   sx={{ color: 'error.main' }}
        // />,
      ],
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'lg'}
        // maxWidth="xl"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CustomBreadcrumbs
          heading="List"
          links={[{ name: 'Secret', href: paths.secret.root }, { name: 'List' }]}
          action={
            <Button
              component={RouterLink}
              href={paths.secret.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Secret
            </Button>
          }
          sx={{
            mb: {
              xs: 3,
              md: 5,
            },
          }}
        />

        <Card
          sx={{
            height: { xs: 800, md: 2 },
            flexGrow: { md: 1 },
            display: { md: 'flex' },
            flexDirection: { md: 'column' },
          }}
        >
          <DataGrid
            checkboxSelection
            disableRowSelectionOnClick
            rows={dataFiltered}
            columns={columns}
            // getRowId={row => `${GenerateUniqueId(row.Name)}`}
            getRowId={(row) => `${row.Name}~${row.CreateTime}`}
            loading={productsLoading}
            getRowHeight={() => 'auto'}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            onRowSelectionModelChange={(newSelectionModel) => {
              setSelectedRowIds(newSelectionModel);
            }}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            slots={{
              toolbar: () => (
                <>
                  <GridToolbarContainer>
                    <ProductTableToolbar
                      filters={filters}
                      onFilters={handleFilters}
                      stockOptions={PRODUCT_STOCK_OPTIONS}
                      publishOptions={PUBLISH_OPTIONS}
                    />

                    <GridToolbarQuickFilter />

                    <Stack
                      spacing={1}
                      flexGrow={1}
                      direction="row"
                      alignItems="center"
                      justifyContent="flex-end"
                    >
                      {!!selectedRowIds.length && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                          onClick={confirmRows.onTrue}
                        >
                          Delete ({selectedRowIds.length})
                        </Button>
                      )}

                      <GridToolbarColumnsButton />
                      <GridToolbarFilterButton />
                      <GridToolbarExport />
                    </Stack>
                  </GridToolbarContainer>

                  {canReset && (
                    <ProductTableFiltersResult
                      filters={filters}
                      onFilters={handleFilters}
                      onResetFilters={handleResetFilters}
                      results={dataFiltered.length}
                      sx={{ p: 2.5, pt: 0 }}
                    />
                  )}
                </>
              ),
              noRowsOverlay: () => <EmptyContent title="No Data" />,
              noResultsOverlay: () => <EmptyContent title="No results found" />,
            }}
            slotProps={{
              columnsPanel: {
                // @ts-ignore
                getTogglableColumns,
              },
            }}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirmRows.value}
        onClose={confirmRows.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selectedRowIds.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              // handleDeleteRows()
              confirmRows.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, filters }: { inputData: any[]; filters: IProductTableFilters }) {
  const { stock, publish } = filters;

  if (stock.length) {
    inputData = inputData.filter((deployment) => stock.includes(deployment.Namespace));
  }

  if (publish.length) {
    inputData = inputData.filter((deployment) =>
      publish.includes(deployment.IsComplete.toString())
    );
  }

  return inputData;
}
