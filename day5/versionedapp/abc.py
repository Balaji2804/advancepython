import schedule_import
import pandas as pd


# Function to create composite index or single index
def create_index(df, index_cols):
    if isinstance(index_cols, list):
        # Combine columns to form a composite index
        df['index'] = df[index_cols].astype(str).agg('-'.join, axis=1)
    else:
        # Use a single column as the index
        df['index'] = df[index_cols].astype(str)
    return df


def compare_csvs(file1_path, file2_path, index_cols, output_path):
    # Read the CSV files into DataFrames
    df1 = pd.read_csv(file1_path, encoding='ISO-8859-1')
    df2 = pd.read_csv(file2_path, encoding='ISO-8859-1')

    # Ensure the index columns are the same for comparison, typically an ID column

    # Create index based on the type of index_cols
    df1 = create_index(df1, index_cols)
    df2 = create_index(df2, index_cols)

    # Set the index to the common column for easier comparison
    df1.set_index('index', inplace=True)
    df2.set_index('index', inplace=True)

    # Initialize an empty DataFrame to store the results
    result = pd.DataFrame(columns=list(df1.columns) + ['status'])

    # Identify deleted records
    deleted = df1[~df1.index.isin(df2.index)]
    deleted.loc[:, 'status'] = 'deleted'

    # Identify added records
    added = df2[~df2.index.isin(df1.index)]
    added.loc[:, 'status'] = 'added'

    # Identify modified records
    common = df1.index.intersection(df2.index)
    modified = df1.loc[common][df1.loc[common] != df2.loc[common]].dropna(how='all')
    for index in modified.index:
        original_row = df1.loc[index].copy()
        modified_row = df2.loc[index].copy()
        original_row['status'] = 'modified (original)'
        modified_row['status'] = 'modified (new)'
        result = pd.concat([result, pd.DataFrame([original_row]), pd.DataFrame([modified_row])])

    result = pd.concat([result, deleted, added])

    # Reset index to split the composite index back into separate columns
    result.reset_index(inplace=True)

    # Save the result to a new CSV file
    result.to_csv(output_path, index=False)

    print("Diff file generated successfully as " + output_path)


if __name__ == '__main__':
    config = {
        # input File paths
        'xml_file_path': 'kis-asc.xml',
        'staff_csv_file_path': 'vc_staff.csv',
        'courses_csv_file_path': 'vc_courses.csv',
        'classrooms_csv_file_path': 'vc_rooms.csv',
        'students_csv_file_path': 'vc_students.csv',

        # output file paths
        'classes_output_file_path': 'classes_inc.csv',
        'class_enrollment_output_file_path': "class_enrollments_inc.csv",
        'class_schedule_output_file_path': "class_schedule_inc.csv",

        # previously uploaded contents
        'prev_classes_output_file_path': 'classes.csv',
        'prev_class_enrollment_output_file_path': "class_enrollments.csv",
        'prev_class_schedule_output_file_path': "class_schedule.csv",

        # output csv file with additional column to tell if its added, modified or deleted
        'diff_classes_output_file_path': 'diff_classes.csv',
        'diff_class_enrollment_output_file_path': "diff_class_enrollments.csv",
        'diff_class_schedule_output_file_path': "diff_class_schedule.csv",

    }

    # schedule_import.process(config)
    compare_csvs(config.get('classes_output_file_path'), config.get('prev_classes_output_file_path'), 'class_id',
                 config.get('diff_classes_output_file_path'))
    compare_csvs(config.get('class_enrollment_output_file_path'), config.get('prev_class_enrollment_output_file_path'),
                 ['class_id', 'veracross_student_id'], config.get('diff_class_enrollment_output_file_path'))
    compare_csvs(config.get('class_schedule_output_file_path'), config.get('prev_class_schedule_output_file_path'),
                 ['class_id', 'day', 'block_id'], config.get('diff_class_schedule_output_file_path'))