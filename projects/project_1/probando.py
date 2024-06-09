import csv
cache = {}

PROJECT_FILES_FIELDNAMES = ['file_id', 'file_name']
PROJECTS_DIR = './projects/project_'
PROJECT_FILES_CSV = 'proj_files.csv'

output_image_name = "kuko__No_RGB_c123p12_NN_HO_P0_NP100.png"
temporal_name = "./layer_i4ht8iz.png"
id_project = 1

# Auxiliary function to modify project CSV files
def register_temp_image(id_project, temporal_name, output_image_name):
    # Add new row in project CSV file relating the temp file and the original name of the image
    print('Qué archivo abre csv: ', './' + PROJECT_FILES_CSV)
    with open('./' + PROJECT_FILES_CSV, "a") as proj_files_csv:
        writer = csv.DictWriter(proj_files_csv, delimiter=";", fieldnames=PROJECT_FILES_FIELDNAMES)
        print('QUÉ LECHES intent escribir en el csv ', str(temporal_name), output_image_name)
        writer.writerow({'file_id': str(temporal_name), 'file_name': output_image_name})

    # Save tmp file in global dictionary of original image name

    print(f'cache[{output_image_name}].append({temporal_name})')
    cache[str(output_image_name)] = temporal_name
    print('cache en el server : ', cache)

register_temp_image(id_project, temporal_name, output_image_name)
